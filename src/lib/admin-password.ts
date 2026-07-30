import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ADMIN_PASSWORD, timingSafeStringEqual } from "@/lib/auth";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SETTINGS_KEY = "admin_password_hash";

async function derive(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derive(password, salt);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await derive(password, salt);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

async function getStoredHash(): Promise<string | null> {
  const [row] = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1);
  const value = row?.value as { hash?: string } | undefined;
  return value?.hash ?? null;
}

export async function setStoredPasswordHash(hash: string): Promise<void> {
  const [existing] = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1);
  if (existing) {
    await db.update(settings).set({ value: { hash }, updatedAt: new Date() }).where(eq(settings.key, SETTINGS_KEY));
  } else {
    await db.insert(settings).values({ key: SETTINGS_KEY, value: { hash } });
  }
}

/**
 * Verifies the admin password against the DB-stored hash if one has been
 * set (via the change-password flow); otherwise falls back to the
 * ADMIN_PASSWORD environment variable, so the site keeps working exactly
 * as before until the owner changes their password for the first time.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await getStoredHash();
  if (stored) return verifyHash(password, stored);
  return timingSafeStringEqual(password, ADMIN_PASSWORD);
}

export { SETTINGS_KEY as ADMIN_PASSWORD_HASH_SETTINGS_KEY };
