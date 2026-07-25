import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Tajawal, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AccountProvider } from "@/lib/account-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_URL = "https://www.velisiabeauty.com";
const SITE_NAME = "velisiabeauty";
const SITE_TITLE = "velisiabeauty — متجر التجميل والعناية بالشعر";
const SITE_DESCRIPTION =
  "velisiabeauty متجر متخصص في منتجات التجميل والعناية بالبشرة والشعر والعطور من أفخم الماركات العالمية. توصيل سريع ومنتجات أصلية ١٠٠٪.";
const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=630&q=80&auto=format&fit=crop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.7.3/moyasar.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={`${tajawal.variable} ${playfair.variable} font-sans antialiased`}
      >
        <AccountProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CartDrawer />
            <ChatWidget />
          </CartProvider>
        </AccountProvider>
        <Script src="https://cdn.moyasar.com/mpf/1.7.3/moyasar.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}