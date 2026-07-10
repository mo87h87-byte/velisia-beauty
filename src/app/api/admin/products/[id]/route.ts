import { db } from "@/db";
import { products } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await request.json();
    const images: string[] = Array.isArray(b.images)
      ? b.images.filter((i: string) => i && i.trim())
      : String(b.images || "")
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean);

    const [updated] = await db
      .update(products)
      .set({
        name: b.name?.trim(),
        brand: b.brand?.trim(),
        category: b.category,
        shortDescription: b.shortDescription?.trim() || "",
        description: b.description?.trim() || "",
        price: String(b.price),
        oldPrice: b.oldPrice ? String(b.oldPrice) : null,
        images: images.length ? images : ["/images/hero.png"],
        stock: Number(b.stock) || 0,
        isFeatured: !!b.isFeatured,
        isBestseller: !!b.isBestseller,
        isNew: !!b.isNew,
      })
      .where(eq(products.id, Number(id)))
      .returning();

    if (!updated) return Response.json({ error: "المنتج غير موجود" }, { status: 404 });
    return Response.json({ product: updated });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, Number(id)));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
