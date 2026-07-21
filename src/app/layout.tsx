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

export const metadata: Metadata = {
  title: "velisiabeauty — متجر التجميل والعناية بالشعر",
  description:
    "velisiabeauty متجر متخصص في منتجات التجميل والعناية بالبشرة والشعر والعطور من أفخم الماركات العالمية. توصيل سريع ومنتجات أصلية ١٠٠٪.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdn.moyasar.com/mpf/1.7.3/moyasar.css" />
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
          </CartProvider>
        </AccountProvider>
        <Script src="https://cdn.moyasar.com/mpf/1.7.3/moyasar.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}