import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
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