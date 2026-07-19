import { db } from "@/db";
import { orders } from "@/db/schema";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/constants";

interface IncomingItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      email,
      phone,
      city,
      address,
      notes,
      paymentMethod,
      paymentStatus,
      items,
    } = body ?? {};

    if (
      !customerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return Response.json({ error: "يرجى تعبئة جميع الحقول المطلوبة" }, { status: 400 });
    }

    const cleanItems: IncomingItem[] = items.map((i: IncomingItem) => ({
      id: Number(i.id),
      name: String(i.name),
      brand: String(i.brand),
      price: Number(i.price),
      quantity: Math.max(1, Number(i.quantity)),
      image: String(i.image),
    }));

    const subtotal = cleanItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `VLS-${Date.now().toString().slice(-6)}${randomPart}`;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        notes: notes?.trim() || null,
        paymentMethod: paymentMethod || "cod",
        paymentStatus: paymentStatus === "paid" ? "paid" : "pending",
        items: cleanItems,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
      })
      .returning();

    return Response.json({ order }, { status: 201 });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}