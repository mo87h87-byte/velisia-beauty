import { db } from "@/db";
import { messages } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return Response.json({ error: "يرجى تعبئة جميع الحقول" }, { status: 400 });
    }
    const [saved] = await db
      .insert(messages)
      .values({
        name: name.trim().slice(0, 80),
        email: email.trim().slice(0, 120),
        subject: subject.trim().slice(0, 150),
        message: message.trim().slice(0, 2000),
      })
      .returning();
    return Response.json({ message: saved }, { status: 201 });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
