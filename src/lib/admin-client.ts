"use client";

const TOKEN_KEY = "velisia_admin_token";

// In-memory token survives client-side navigation within a single page load.
// This is the reliable source when the browser blocks localStorage/cookies
// inside a cross-origin iframe (e.g. the preview environment).
let memoryToken: string | null = null;

export function saveAdminToken(token: string) {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage may be blocked in iframe — memory token still works */
  }
}

export function getAdminToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) memoryToken = t;
    return t;
  } catch {
    return memoryToken;
  }
}

export function clearAdminToken() {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** fetch wrapper that attaches the admin Bearer token. */
export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
