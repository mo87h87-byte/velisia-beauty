import type { Metadata } from "next";
import ProductsBrowser from "@/components/ProductsBrowser";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسوّقي كل المنتجات | velisiabeauty",
  description:
    "تصفّحي التشكيلة الكاملة من منتجات المكياج والعناية بالبشرة والشعر والعطور والأظافر في velisiabeauty، مع فلاتر حسب الفئة والسعر والماركة.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const products = await getAllProducts();

  return (
    <ProductsBrowser
      products={products}
      initialCategory={category}
      initialQuery={q}
    />
  );
}
