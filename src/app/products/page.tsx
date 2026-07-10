import ProductsBrowser from "@/components/ProductsBrowser";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

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
