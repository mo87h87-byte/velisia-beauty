import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return Response.json({ settings: result });
}