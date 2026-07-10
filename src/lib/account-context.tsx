"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
}

const TOKEN_KEY = "velisia_customer_token";
let memoryToken: string | null = null;

function readToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) memoryToken = t;
    return t;
  } catch {
    return memoryToken;
  }
}

function writeToken(token: string) {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

function removeToken() {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function accountFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = readToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}

interface AccountContextValue {
  customer: Customer | null;
  ready: boolean;
  setSession: (token: string, customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setReady(true);
      return;
    }
    (async () => {
      try {
        const res = await accountFetch("/api/account/me");
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
        } else {
          removeToken();
        }
      } catch {
        /* ignore */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setSession = useCallback((token: string, c: Customer) => {
    writeToken(token);
    setCustomer(c);
  }, []);

  const updateCustomer = useCallback((c: Customer) => setCustomer(c), []);

  const logout = useCallback(() => {
    removeToken();
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ customer, ready, setSession, updateCustomer, logout }),
    [customer, ready, setSession, updateCustomer, logout],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
