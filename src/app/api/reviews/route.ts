import { db } from "@/db";
import { reviews } from "@/db/schema";
import { clampRating } from "@/lib/format";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, author, title, comment, rating } = body ?? {};

    if (
      !productId ||
      typeof author !== "string" ||
      typeof title !== "string" ||
      typeof comment !== "string" ||
      !author.trim() ||
      !comment.trim()
    ) {
      return Response.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const safeRating = clampRating(rating);

    const [review] = await db
      .insert(reviews)
      .values({
        productId: Number(productId),
        author: author.trim().slice(0, 60),
        title: title.trim().slice(0, 120),
        comment: comment.trim().slice(0, 1000),
        rating: safeRating,
      })
      .returning();

    return Response.json({ review }, { status: 201 });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
