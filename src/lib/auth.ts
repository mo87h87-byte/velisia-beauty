import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "velisia_admin";
const SECRET = process.env.ADMIN_SECRET || "velisia-super-secret-key-2026";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "velisia2026";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createToken(): string {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  return sign(payload) === parts[2];
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/**
 * Authorize an API request. Works both via the `Authorization: Bearer <token>`
 * header (used by the localStorage-based admin client — reliable inside
 * cross-origin iframes) and via the session cookie as a fallback.
 */
export async function isAuthorized(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    if (verifyToken(header.slice(7))) return true;
  }
  return isAdminAuthenticated();
}

export { COOKIE_NAME };
