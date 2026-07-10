import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createCustomerToken } from "@/lib/customer-auth";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();
    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      String(password).length < 6
    ) {
      return Response.json(
        { error: "يرجى تعبئة الحقول (كلمة المرور ٦ أحرف على الأقل)" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, normalizedEmail))
      .limit(1);
    if (existing.length) {
      return Response.json(
        { error: "هذا البريد الإلكتروني مسجّل مسبقاً" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(customers)
      .values({
        name: String(name).trim().slice(0, 80),
        email: normalizedEmail,
        phone: phone ? String(phone).trim().slice(0, 20) : "",
        passwordHash: hashPassword(String(password)),
      })
      .returning();

    const token = createCustomerToken(created.id);
    return Response.json(
      {
        token,
        customer: {
          id: created.id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          city: created.city,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
