import { db } from "@/db";
import { products, reviews, type Product, type Review } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllProducts(): Promise<Product[]> {
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true))
    .orderBy(desc(products.createdAt));
}

export async function getBestsellers(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isBestseller, true))
    .orderBy(desc(products.rating));
}

export async function getNewArrivals(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isNew, true))
    .orderBy(desc(products.createdAt));
}

export async function getProductBySlug(
  slug: string,
): Promise<{ product: Product; reviews: Review[] } | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return null;
  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, product.id))
    .orderBy(desc(reviews.createdAt));
  return { product, reviews: productReviews };
}

export async function getRelatedProducts(
  category: string,
  excludeId: number,
): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.category, category))
    .limit(6);
  return rows.filter((p) => p.id !== excludeId).slice(0, 4);
}
