import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { orderNumber } = await request.json();
    if (!orderNumber?.trim()) {
      return Response.json({ error: "يرجى إدخال رقم الطلب" }, { status: 400 });
    }
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber.trim()))
      .limit(1);

    if (!order) {
      return Response.json({ error: "لم يتم العثور على طلب بهذا الرقم" }, { status: 404 });
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
