import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://cdn.moyasar.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://cdn.moyasar.com",
  "img-src 'self' data: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://images.pexels.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.moyasar.com https://cdn.moyasar.com",
  "frame-src https://secure.moyasar.com https://cdn.moyasar.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.moyasar.com",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;