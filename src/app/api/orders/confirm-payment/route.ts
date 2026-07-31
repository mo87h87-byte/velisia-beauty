import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyMoyasarPaid } from "@/lib/moyasar";

// Called when the shopper returns from Moyasar's hosted payment form. The
// order row already exists (created as "awaiting_payment" before the
// redirect, see /api/orders) — this only ever updates that same row, it
// never creates a new one, so a payment attempt can't produce duplicate
// orders.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, paymentId } = body ?? {};

    if (
      typeof orderNumber !== "string" ||
      !orderNumber.trim() ||
      typeof paymentId !== "string" ||
      !paymentId.trim()
    ) {
      return Response.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .limit(1);

    if (!order) {
      return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Already confirmed (e.g. the shopper refreshed this page) — return the
    // order as-is instead of re-verifying or erroring.
    if (order.status !== "awaiting_payment") {
      return Response.json({ order });
    }

    const paid = await verifyMoyasarPaid(paymentId.trim());
    if (!paid) {
      return Response.json({ error: "تعذر تأكيد عملية الدفع" }, { status: 402 });
    }

    const [updated] = await db
      .update(orders)
      .set({ status: "processing", paymentStatus: "paid" })
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .returning();

    return Response.json({ order: updated });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
