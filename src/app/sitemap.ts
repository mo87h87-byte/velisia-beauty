import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";

const BASE_URL = "https://www.velisiabeauty.com";

const STATIC_PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "products", changeFrequency: "daily", priority: 0.9 },
  { path: "pages/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "pages/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "pages/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "pages/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "pages/terms", changeFrequency: "monthly", priority: 0.3 },
  { path: "pages/returns", changeFrequency: "monthly", priority: 0.4 },
  { path: "pages/payment", changeFrequency: "monthly", priority: 0.4 },
  { path: "pages/track-order", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${BASE_URL}/${path}` : BASE_URL,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${encodeURIComponent(p.slug)}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
