import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { isCronAuthorized } from "@/lib/auth";
import { getMoyasarPaymentStatus } from "@/lib/moyasar";

// Safety net for card orders left in "awaiting_payment": the webhook and the
// shopper's own return-trip request (confirm-payment) cover the normal
// cases, but neither is guaranteed (missed webhook delivery, shopper closes
// the tab). Runs once daily (Vercel Hobby cron limit) — an order can sit
// past its 1h cutoff for up to ~24h worst case before this catches it,
// which is acceptable for a cleanup job, not a time-critical one.
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - EXPIRY_MS);
    const staleOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.status, "awaiting_payment"), lt(orders.createdAt, cutoff)));

    let confirmed = 0;
    let cancelled = 0;
    let skipped = 0;

    for (const order of staleOrders) {
      // Never even reached Moyasar's on_completed (abandoned before
      // submitting card details) — nothing to check, safe to cancel.
      if (!order.moyasarPaymentId) {
        await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
        cancelled++;
        continue;
      }

      const status = await getMoyasarPaymentStatus(order.moyasarPaymentId);

      if (status === "paid") {
        await db
          .update(orders)
          .set({ status: "processing", paymentStatus: "paid" })
          .where(eq(orders.id, order.id));
        confirmed++;
      } else if (status === null) {
        // Couldn't get a definitive answer from Moyasar (network/API
        // issue) — leave it as-is and retry on the next run rather than
        // risk cancelling a payment that actually went through.
        skipped++;
      } else {
        await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
        cancelled++;
      }
    }

    return NextResponse.json({ checked: staleOrders.length, confirmed, cancelled, skipped });
  } catch (err) {
    console.error("reconcile-payments cron error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
