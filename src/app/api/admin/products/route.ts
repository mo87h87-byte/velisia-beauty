import { db } from "@/db";
import { products } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { desc } from "drizzle-orm";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`
  );
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return Response.json({ products: rows });
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const b = await request.json();
    if (!b.name?.trim() || !b.brand?.trim() || !b.price) {
      return Response.json({ error: "الاسم والماركة والسعر مطلوبة" }, { status: 400 });
    }
    const images: string[] = Array.isArray(b.images)
      ? b.images.filter((i: string) => i && i.trim())
      : String(b.images || "")
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean);

    const [created] = await db
      .insert(products)
      .values({
        slug: b.slug?.trim() || slugify(b.name),
        name: b.name.trim(),
        brand: b.brand.trim(),
        category: b.category || "makeup",
        shortDescription: b.shortDescription?.trim() || "",
        description: b.description?.trim() || "",
        price: String(b.price),
        oldPrice: b.oldPrice ? String(b.oldPrice) : null,
        images: images.length ? images : ["/images/hero.png"],
        rating: b.rating ? String(b.rating) : "5.0",
        reviewCount: Number(b.reviewCount) || 0,
        stock: Number(b.stock) || 0,
        isFeatured: !!b.isFeatured,
        isBestseller: !!b.isBestseller,
        isRecommended: !!b.isRecommended,
        isNew: !!b.isNew,
      })
      .returning();
    return Response.json({ product: created }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error && err.message.includes("unique")
      ? "الرابط (slug) مستخدم مسبقاً"
      : "خطأ في الخادم";
    return Response.json({ error: msg }, { status: 500 });
  }
}