import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";
import { PAYMENT_STATUSES } from "@/lib/order-status";

// Different payment providers use different status vocabularies; map them
// onto the storefront's own payment statuses so one endpoint can serve all
// of them.
const PROVIDER_STATUS_MAP: Record<string, (typeof PAYMENT_STATUSES)[number]> = {
  paid: "paid",
  succeeded: "paid",
  completed: "paid",
  authorized: "paid",
  captured: "paid",
  failed: "pending",
  voided: "pending",
  cancelled: "pending",
  refunded: "refunded",
  partially_refunded: "refunded",
  reversed: "refunded",
};

function isAuthorized(request: Request): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return false;
  const provided = request.headers.get("x-webhook-secret") || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderNumber =
      typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const rawStatus =
      typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
    if (!orderNumber || !rawStatus) {
      return Response.json(
        { error: "orderNumber و status مطلوبان" },
        { status: 400 },
      );
    }

    const mappedStatus = (
      PAYMENT_STATUSES as readonly string[]
    ).includes(rawStatus)
      ? (rawStatus as (typeof PAYMENT_STATUSES)[number])
      : PROVIDER_STATUS_MAP[rawStatus];
    if (!mappedStatus) {
      return Response.json({ error: "قيمة status غير معروفة" }, { status: 400 });
    }

    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));
    if (!current) {
      return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const patch: Partial<typeof orders.$inferInsert> = {
      paymentStatus: mappedStatus,
    };
    // Auto-advance a fresh order to "processing" the moment its payment is
    // confirmed as paid, matching the admin order-update rule.
    if (mappedStatus === "paid" && current.status === "new") {
      patch.status = "processing";
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.orderNumber, orderNumber))
      .returning();

    return Response.json({ order: updated });
  } catch (err) {
    console.error("payment webhook error:", err);
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
