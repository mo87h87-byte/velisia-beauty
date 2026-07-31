import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";

// Moyasar delivers its shared secret inside the webhook body itself (the
// `secret_token` field on the event payload — see Moyasar's Webhook
// Reference docs), not as a request header, so this can only run after the
// body is parsed.
function isAuthorized(secretToken: unknown): boolean {
  const expected = process.env.MOYASAR_WEBHOOK_SECRET;
  if (!expected || typeof secretToken !== "string") return false;
  const a = Buffer.from(secretToken);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Fires when a payment reaches its final state on Moyasar's side, whether
// or not the shopper ever makes it back to /checkout — this is what
// actually closes the gap the confirm-payment return-trip flow can't cover
// on its own (closed tab, dropped connection, etc).
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isAuthorized(body?.secret_token)) {
      return Response.json({ error: "غير مصرّح" }, { status: 401 });
    }

    // Only "payment_paid" moves an order forward here; a failed/abandoned
    // attempt is left as "awaiting_payment" for the (separate, not-yet-built)
    // expiry cleanup to handle, rather than guessing at cancellation here.
    if (body?.type !== "payment_paid") {
      return Response.json({ received: true });
    }

    const payment = body?.data;
    const orderNumber = payment?.metadata?.order_number;
    if (typeof orderNumber !== "string" || !orderNumber.trim()) {
      console.error("moyasar webhook: payment_paid with no order_number in metadata", payment?.id);
      return Response.json({ received: true });
    }

    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()));

    if (!current) {
      console.error("moyasar webhook: order not found", orderNumber);
      return Response.json({ received: true });
    }

    // Already confirmed — most likely the shopper's own return-trip request
    // to /api/orders/confirm-payment beat the webhook to it. Idempotent,
    // nothing to do.
    if (current.status !== "awaiting_payment") {
      return Response.json({ order: current });
    }

    if (payment?.status !== "paid") {
      return Response.json({ received: true });
    }

    const [updated] = await db
      .update(orders)
      .set({ status: "processing", paymentStatus: "paid" })
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .returning();

    return Response.json({ order: updated });
  } catch (err) {
    console.error("moyasar webhook error:", err);
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
