import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.velisiabeauty.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return { title: "المنتج غير موجود | velisiabeauty" };

  const title = `${data.product.name} | velisiabeauty`;
  const description = data.product.shortDescription;
  const url = `${SITE_URL}/products/${encodeURIComponent(data.product.slug)}`;
  const image = data.product.images?.[0];

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const related = await getRelatedProducts(data.product.category, data.product.id);

  const { product } = data;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.shortDescription,
    sku: String(product.id),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      priceCurrency: "SAR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(Number(product.reviewCount) > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    ...(data.reviews.length > 0
      ? {
          review: data.reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            name: r.title,
            reviewBody: r.comment,
            datePublished: r.createdAt.toISOString(),
          })),
        }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={data.product} reviews={data.reviews} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-plum-900">
            قد يعجبكِ أيضاً
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                brand={p.brand}
                price={Number(p.price)}
                oldPrice={p.oldPrice ? Number(p.oldPrice) : undefined}
                discount={undefined}
                rating={Number(p.rating)}
                image={p.images?.[0] ?? ""}
                link={`/products/${p.slug}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}