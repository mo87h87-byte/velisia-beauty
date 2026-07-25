import type { MetadataRoute } from "next";

const BASE_URL = "https://www.velisiabeauty.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api/",
        "/checkout",
        "/account",
        "/wishlist",
        "/pages/velisia-key-667",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
