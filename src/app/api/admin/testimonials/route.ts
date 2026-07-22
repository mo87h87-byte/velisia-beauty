import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt));
  return Response.json({ testimonials: rows });
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const b = await request.json();
    const id = Number(b.id);
    if (!id) {
      return Response.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const updates: Partial<{ isVisible: boolean; isPinned: boolean }> = {};
    if (typeof b.isVisible === "boolean") updates.isVisible = b.isVisible;
    if (typeof b.isPinned === "boolean") updates.isPinned = b.isPinned;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "لا يوجد تحديث" }, { status: 400 });
    }

    const [updated] = await db
      .update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    return Response.json({ testimonial: updated });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return Response.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning();

    if (!deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}