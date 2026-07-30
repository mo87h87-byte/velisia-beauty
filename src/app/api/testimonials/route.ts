import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { clampRating } from "@/lib/format";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, comment, rating } = body ?? {};

    if (
      typeof name !== "string" ||
      typeof comment !== "string" ||
      !name.trim() ||
      !comment.trim()
    ) {
      return Response.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const safeRating = clampRating(rating);

    const [testimonial] = await db
      .insert(testimonials)
      .values({
        name: name.trim().slice(0, 60),
        comment: comment.trim().slice(0, 500),
        rating: safeRating,
        isVisible: false,
        isPinned: false,
      })
      .returning();

    return Response.json({ testimonial }, { status: 201 });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}