"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "./constants";

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "REMOVE"; id: number }
  | { type: "SET_QTY"; id: number; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const qty = action.quantity ?? 1;
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...state, { ...action.item, quantity: qty }];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "SET_QTY":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i,
        )
        .filter((i) => i.quantity > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "velisia-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // Safety net: force the cart drawer closed shortly after the app mounts,
    // in case its open state was left true by a stale render/hot-reload.
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      items,
      addItem: (item, quantity) => {
        dispatch({ type: "ADD", item, quantity });
        setIsOpen(true);
      },
      removeItem: (id) => dispatch({ type: "REMOVE", id }),
      setQuantity: (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
      clear: () => dispatch({ type: "CLEAR" }),
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}