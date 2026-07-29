import { db } from "@/db";
import { products, reviews, type Product, type Review } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

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
    .orderBy(asc(products.sortOrder), desc(products.rating));
}

export async function getNewArrivals(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isNew, true))
    .orderBy(desc(products.createdAt));
}

export async function getRecommended(): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isRecommended, true))
    .orderBy(desc(products.rating));
}

export async function getProductBySlug(
  slug: string,
): Promise<{ product: Product; reviews: Review[] } | null> {
  // In production, dynamic route params for non-ASCII slugs (e.g. Arabic)
  // arrive still percent-encoded instead of decoded, so the raw value never
  // matches the DB's stored slug. Decode defensively; a plain slug with no
  // "%" sequences passes through unchanged.
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    /* malformed sequence, fall back to the raw value */
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, decodedSlug))
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