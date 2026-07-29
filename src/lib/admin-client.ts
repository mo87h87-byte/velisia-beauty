"use client";

const TOKEN_KEY = "velisia_admin_token";
const CSRF_TOKEN_KEY = "velisia_admin_csrf_token";

// In-memory token survives client-side navigation within a single page load.
// This is the reliable source when the browser blocks localStorage/cookies
// inside a cross-origin iframe (e.g. the preview environment).
let memoryToken: string | null = null;
let memoryCsrfToken: string | null = null;

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

/** Paired with the admin token — every mutating admin request must send it back as X-CSRF-Token. */
export function saveAdminCsrfToken(token: string) {
  memoryCsrfToken = token;
  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {
    /* storage may be blocked in iframe — memory token still works */
  }
}

export function getAdminCsrfToken(): string | null {
  if (memoryCsrfToken) return memoryCsrfToken;
  try {
    const t = localStorage.getItem(CSRF_TOKEN_KEY);
    if (t) memoryCsrfToken = t;
    return t;
  } catch {
    return memoryCsrfToken;
  }
}

export function clearAdminToken() {
  memoryToken = null;
  memoryCsrfToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CSRF_TOKEN_KEY);
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
  const csrfToken = getAdminCsrfToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
 const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    if (init.body && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  
  return fetch(input, { ...init, headers });
}
