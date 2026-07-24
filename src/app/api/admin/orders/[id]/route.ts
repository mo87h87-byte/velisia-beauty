import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { eq } from "drizzle-orm";

const ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "refunded"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await request.json();
    const patch: Record<string, string> = {};
    if (b.status && ORDER_STATUSES.includes(b.status)) patch.status = b.status;
    if (b.paymentStatus && PAYMENT_STATUSES.includes(b.paymentStatus))
      patch.paymentStatus = b.paymentStatus;
    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "لا يوجد تحديث صالح" }, { status: 400 });
    }
    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, Number(id)))
      .returning();
    if (!updated) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    return Response.json({ order: updated });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(orders)
      .where(eq(orders.id, Number(id)))
      .returning();
    if (!deleted) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}