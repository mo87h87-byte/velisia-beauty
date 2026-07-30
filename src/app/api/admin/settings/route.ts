import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { ADMIN_PASSWORD_HASH_SETTINGS_KEY } from "@/lib/admin-password";
import { eq } from "drizzle-orm";

// The "theme" setting's string values are interpolated directly into a
// <style> tag on every page (see buildThemeCss) — if any of them ever
// contained something like `</style><script>`, that would be stored XSS
// hitting every visitor. Every string anywhere in the value must look like
// a plain CSS color; anything else rejects the whole write.
const SAFE_COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s]+\)|hsla?\([\d.,%\s]+\))$/;

function isSafeThemeValue(value: unknown): boolean {
  if (typeof value === "string") return SAFE_COLOR_PATTERN.test(value.trim());
  if (Array.isArray(value)) return value.every(isSafeThemeValue);
  if (value && typeof value === "object") {
    return Object.values(value).every(isSafeThemeValue);
  }
  return true; // numbers/booleans/null can't carry markup
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    if (row.key === ADMIN_PASSWORD_HASH_SETTINGS_KEY) continue;
    result[row.key] = row.value;
  }
  return Response.json({ settings: result });
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const b = await request.json();
    const key = String(b.key || "").trim();
    if (!key || b.value === undefined) {
      return Response.json({ error: "المفتاح والقيمة مطلوبان" }, { status: 400 });
    }
    if (key === ADMIN_PASSWORD_HASH_SETTINGS_KEY) {
      return Response.json({ error: "غير مسموح بتعديل هذا المفتاح من هنا" }, { status: 400 });
    }
    if (key === "theme" && !isSafeThemeValue(b.value)) {
      return Response.json({ error: "قيم الألوان غير صحيحة" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: b.value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return Response.json({ setting: updated });
    } else {
      const [created] = await db
        .insert(settings)
        .values({ key, value: b.value })
        .returning();
      return Response.json({ setting: created }, { status: 201 });
    }
  } catch (err) {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}