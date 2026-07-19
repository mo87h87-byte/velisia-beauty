import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

const SECRET: string = (() => {
  const value = process.env.ADMIN_SECRET;
  if (!value) {
    throw new Error("ADMIN_SECRET environment variable is not set");
  }
  return value;
})();

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== derived.length) return false;
  return timingSafeEqual(keyBuf, derived);
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createCustomerToken(customerId: number): string {
  const payload = `cust.${customerId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the customer id if the token is valid, otherwise null. */
export function verifyCustomerToken(
  token: string | undefined | null,
): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  if (sign(payload) !== parts[3]) return null;
  if (parts[0] !== "cust") return null;
  const id = Number(parts[1]);
  return Number.isFinite(id) ? id : null;
}

export function getCustomerIdFromRequest(request: Request): number | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyCustomerToken(header.slice(7));
  }
  return null;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

/** Returns true if this email has hit the failed-login limit recently. */
export async function isRateLimited(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, normalizedEmail),
        eq(loginAttempts.success, "false"),
        gt(loginAttempts.createdAt, windowStart)
      )
    );

  const failedCount = Number(result[0]?.count ?? 0);
  return failedCount >= MAX_ATTEMPTS;
}

/** Records a login attempt (success or failure) for rate-limiting purposes. */
export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db.insert(loginAttempts).values({
    email: normalizedEmail,
    success: success ? "true" : "false",
  });
}