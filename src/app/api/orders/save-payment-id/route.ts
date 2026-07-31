import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

// Called right after Moyasar creates the payment (via the hosted form's
// on_completed callback) — before any 3-D Secure redirect — so the
// reconciliation cron has a payment id to look up even if the shopper's
// connection drops mid-redirect and confirm-payment/the webhook never fire.
// Best-effort only: never verifies or confirms payment itself.
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

    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .limit(1);

    if (!current) {
      return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Only meaningful while still awaiting payment — never overwrite a
    // confirmed order's payment id from a stray/late call.
    if (current.status !== "awaiting_payment") {
      return Response.json({ ok: true });
    }

    await db
      .update(orders)
      .set({ moyasarPaymentId: paymentId.trim() })
      .where(eq(orders.orderNumber, orderNumber.trim()));

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
