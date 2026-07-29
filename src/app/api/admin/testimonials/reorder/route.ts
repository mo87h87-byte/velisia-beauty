import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const b = await request.json();
    const ids: number[] = Array.isArray(b.ids) ? b.ids.map(Number).filter(Boolean) : [];
    if (!ids.length) {
      return Response.json({ error: "قائمة المعرّفات مطلوبة" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx.update(testimonials).set({ sortOrder: i }).where(eq(testimonials.id, ids[i]));
      }
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
