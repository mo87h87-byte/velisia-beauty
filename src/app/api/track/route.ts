import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

// Saudi mobile numbers are 9 digits once the leading 0 / country code is
// stripped, so comparing the last 9 digits matches "0501234567",
// "501234567", and "+966501234567" as the same number.
function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-9);
}

export async function POST(request: Request) {
  try {
    const { orderNumber, phone } = await request.json();
    if (!orderNumber?.trim() || !phone?.trim()) {
      return Response.json({ error: "يرجى إدخال رقم الطلب ورقم الجوال" }, { status: 400 });
    }
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .limit(1);

    const normalizedInput = normalizePhone(phone);
    const matches =
      order && normalizedInput.length === 9 && normalizePhone(order.phone) === normalizedInput;

    if (!matches) {
      // Same generic message whether the order doesn't exist or the phone
      // doesn't match it — never reveal which, to avoid order-number
      // enumeration combined with phone guessing.
      return Response.json({ error: "لم يتم العثور على طلب بهذه البيانات" }, { status: 404 });
    }

    // Return only public-safe tracking fields.
    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        paymentStatus: order.paymentStatus,
        city: order.city,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
