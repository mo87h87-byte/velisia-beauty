import { db } from "@/db";
import { settings } from "@/db/schema";
import { ADMIN_PASSWORD_HASH_SETTINGS_KEY } from "@/lib/admin-password";

export async function GET() {
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    if (row.key === ADMIN_PASSWORD_HASH_SETTINGS_KEY) continue;
    result[row.key] = row.value;
  }
  return Response.json({ settings: result });
}