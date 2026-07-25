import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "velisia_admin";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

const SECRET = requireEnv("ADMIN_SECRET");

export const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");

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

/**
 * Authorize a cron-triggered request via `Authorization: Bearer <CRON_SECRET>`
 * (the header Vercel Cron sends automatically when CRON_SECRET is set).
 * Fails closed: if CRON_SECRET isn't configured, no request is authorized.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME };
