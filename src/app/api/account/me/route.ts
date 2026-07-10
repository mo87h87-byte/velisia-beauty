import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCustomerIdFromRequest } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!customer) {
    return Response.json({ error: "الحساب غير موجود" }, { status: 404 });
  }

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.email, customer.email))
    .orderBy(desc(orders.createdAt));

  return Response.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
    },
    orders: customerOrders,
  });
}

export async function PUT(request: Request) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { name, phone, city } = await request.json();
    const [updated] = await db
      .update(customers)
      .set({
        name: name ? String(name).trim().slice(0, 80) : undefined,
        phone: phone !== undefined ? String(phone).trim().slice(0, 20) : undefined,
        city: city !== undefined ? String(city).trim().slice(0, 60) : undefined,
      })
      .where(eq(customers.id, customerId))
      .returning();
    return Response.json({
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        city: updated.city,
      },
    });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
