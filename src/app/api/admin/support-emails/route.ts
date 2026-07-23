import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

// جلب كل الإيميلات المعلّقة (اللي محتاجة رد يدوي)
export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT id, gmail_message_id, from_email, from_name, subject, body, reason, status, received_at
      FROM support_emails
      WHERE status = 'pending'
      ORDER BY received_at DESC
    `);

    return NextResponse.json({ emails: result.rows });
  } catch (error) {
    console.error("خطأ في جلب الإيميلات:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإيميلات" },
      { status: 500 }
    );
  }
}

// تعليم إيميل معين كـ "تم الرد عليه"
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    }

    await db.execute(sql`
      UPDATE support_emails
      SET status = 'resolved', resolved_at = NOW()
      WHERE id = ${id}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("خطأ في تحديث الإيميل:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحديث" },
      { status: 500 }
    );
  }
}