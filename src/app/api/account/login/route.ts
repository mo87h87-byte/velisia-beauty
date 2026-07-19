import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createCustomerToken,
  isRateLimited,
  recordLoginAttempt,
} from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email?.trim() || !password) {
      return Response.json({ error: "يرجى إدخال البريد وكلمة المرور" }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    if (await isRateLimited(normalizedEmail)) {
      return Response.json(
        { error: "محاولات كثيرة جدًا، يرجى المحاولة بعد 15 دقيقة" },
        { status: 429 },
      );
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, normalizedEmail))
      .limit(1);

    if (!customer || !verifyPassword(String(password), customer.passwordHash)) {
      await recordLoginAttempt(normalizedEmail, false);
      return Response.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }

    await recordLoginAttempt(normalizedEmail, true);

    const token = createCustomerToken(customer.id);
    return Response.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
      },
    });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}