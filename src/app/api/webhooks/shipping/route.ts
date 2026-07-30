import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { timingSafeEqual } from "crypto";
import { ORDER_STATUSES } from "@/lib/order-status";
import { sendEmail } from "@/lib/gmail";
import { buildShippedEmail, buildDeliveredEmail } from "@/lib/order-status-email";

// Different carriers use different status vocabularies; map them onto the
// storefront's own order statuses so one endpoint can serve all of them.
const CARRIER_STATUS_MAP: Record<string, (typeof ORDER_STATUSES)[number]> = {
  picked_up: "processing",
  in_transit: "shipped",
  out_for_delivery: "shipped",
  shipped: "shipped",
  delivered: "delivered",
  failed_delivery: "shipped",
  returned: "cancelled",
  cancelled: "cancelled",
};

function isAuthorized(request: Request): boolean {
  const secret = process.env.SHIPPING_WEBHOOK_SECRET;
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
      ORDER_STATUSES as readonly string[]
    ).includes(rawStatus)
      ? (rawStatus as (typeof ORDER_STATUSES)[number])
      : CARRIER_STATUS_MAP[rawStatus];
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

    const patch: Partial<typeof orders.$inferInsert> = { status: mappedStatus };
    if (typeof body.trackingNumber === "string" && body.trackingNumber.trim()) {
      patch.trackingNumber = body.trackingNumber.trim();
    }
    if (typeof body.carrier === "string" && body.carrier.trim()) {
      patch.carrier = body.carrier.trim();
    }
    if (mappedStatus === "shipped" && !current.shippedAt) {
      patch.shippedAt = new Date();
    }
    if (mappedStatus === "delivered" && !current.deliveredAt) {
      patch.deliveredAt = new Date();
    }

    const [updated] = await db
      .update(orders)
      .set(patch)
      .where(eq(orders.orderNumber, orderNumber))
      .returning();

    const justShipped = mappedStatus === "shipped" && current.status !== "shipped";
    const justDelivered = mappedStatus === "delivered" && current.status !== "delivered";
    if ((justShipped || justDelivered) && updated.email) {
      try {
        const emailData = {
          orderNumber: updated.orderNumber,
          customerName: updated.customerName,
          carrier: updated.carrier,
          trackingNumber: updated.trackingNumber,
        };
        const { subject, html } = justShipped
          ? buildShippedEmail(emailData)
          : buildDeliveredEmail(emailData);
        await sendEmail(updated.email, subject, html);
      } catch (err) {
        console.error("shipping status email failed:", err);
      }
    }

    return Response.json({ order: updated });
  } catch (err) {
    console.error("shipping webhook error:", err);
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
