import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getShippingSettings } from "@/lib/shipping-settings";

interface IncomingItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

const PRICE_TOLERANCE = 0.01;

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

    // Only methods actually offered at checkout — Apple Pay / STC Pay were
    // removed from the UI since they were never wired to a real gateway.
    if (paymentMethod && paymentMethod !== "cod" && paymentMethod !== "card") {
      return Response.json({ error: "طريقة الدفع غير مدعومة" }, { status: 400 });
    }

    const requestedItems = (items as IncomingItem[]).map((i) => ({
      id: Number(i.id),
      quantity: Math.max(1, Number(i.quantity) || 1),
    }));

    if (requestedItems.some((i) => !Number.isFinite(i.id) || i.id <= 0)) {
      return Response.json({ error: "بيانات المنتجات غير صحيحة" }, { status: 400 });
    }

    // Re-price every line item from the database — the client's submitted
    // prices are never trusted, only used below to detect tampering/staleness.
    const ids = [...new Set(requestedItems.map((i) => i.id))];
    const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    if (dbProducts.length !== ids.length) {
      return Response.json({ error: "بعض المنتجات غير موجودة" }, { status: 400 });
    }

    const priceMismatch = (items as IncomingItem[]).some((incoming) => {
      const real = productMap.get(Number(incoming.id));
      return !real || Math.abs(Number(incoming.price) - Number(real.price)) > PRICE_TOLERANCE;
    });
    if (priceMismatch) {
      return Response.json(
        { error: "أسعار بعض المنتجات تغيّرت، يرجى تحديث السلة وإعادة المحاولة" },
        { status: 409 },
      );
    }

    const cleanItems: IncomingItem[] = requestedItems.map(({ id, quantity }) => {
      const p = productMap.get(id)!;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        quantity,
        image: p.images?.[0] || "",
      };
    });

    const subtotal = cleanItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const { fee: shippingFee, freeThreshold } = await getShippingSettings();
    const shipping = subtotal >= freeThreshold ? 0 : shippingFee;
    const total = subtotal + shipping;

    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `VLS-${Date.now().toString().slice(-6)}${randomPart}`;

    // Card orders are created here as a placeholder, *before* the shopper is
    // handed off to Moyasar's hosted payment form — this is what makes sure a
    // record exists even if they never come back (closed tab, failed
    // payment, etc). Payment is never verified at this point; that only
    // happens in /api/orders/confirm-payment once Moyasar redirects back, so
    // this order can never be created as "paid" — only the confirm-payment
    // route (which independently re-verifies with Moyasar) can flip it.
    const isCard = paymentMethod === "card";
    const finalPaymentStatus: "paid" | "pending" = "pending";
    const initialStatus = isCard ? "awaiting_payment" : "new";

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
        paymentStatus: finalPaymentStatus,
        status: initialStatus,
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