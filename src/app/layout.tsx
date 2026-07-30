import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import {
  Tajawal,
  Playfair_Display,
  Cairo,
  Cormorant_Garamond,
  Almarai,
  Marcellus,
  IBM_Plex_Sans_Arabic,
  Amiri,
  Noto_Kufi_Arabic,
  El_Messiri,
  Reem_Kufi,
  Changa,
  Markazi_Text,
  Aref_Ruqaa,
  Lalezar,
  Alexandria,
  Readex_Pro,
  Noto_Sans_Arabic,
  Mada,
  Vazirmatn,
  Baloo_Bhaijaan_2,
  Harmattan,
  Lemonada,
  Rakkas,
  Mirza,
  Noto_Naskh_Arabic,
  Italiana,
  Prata,
  Bodoni_Moda,
  Jomhuria,
  Katibeh,
} from "next/font/google";
import "./globals.css";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { type Theme, defaultTheme, buildThemeCss, mergeShades } from "@/lib/site-defaults";
import { CartProvider } from "@/lib/cart-context";
import { getShippingSettings } from "@/lib/shipping-settings";
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

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibmplex-arabic",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-kufi",
  display: "swap",
});

const elMessiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-el-messiri",
  display: "swap",
});

const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-reem-kufi",
  display: "swap",
});

const changa = Changa({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-changa",
  display: "swap",
});

const markaziText = Markazi_Text({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-markazi",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

const lalezar = Lalezar({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-lalezar",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-alexandria",
  display: "swap",
});

const readexPro = Readex_Pro({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-readex-pro",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

const mada = Mada({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mada",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const balooBhaijaan = Baloo_Bhaijaan_2({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-baloo-bhaijaan",
  display: "swap",
});

const harmattan = Harmattan({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-harmattan",
  display: "swap",
});

const lemonada = Lemonada({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lemonada",
  display: "swap",
});

const rakkas = Rakkas({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-rakkas",
  display: "swap",
});

const mirza = Mirza({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mirza",
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-naskh-arabic",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
  display: "swap",
});

const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const jomhuria = Jomhuria({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jomhuria",
  display: "swap",
});

const katibeh = Katibeh({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-katibeh",
  display: "swap",
});

// Body (paragraph/UI) font options — all Arabic-capable.
export const BODY_FONTS = [
  { id: "tajawal", label: "تجوال (الافتراضي)", font: tajawal },
  { id: "cairo", label: "كايرو", font: cairo },
  { id: "almarai", label: "المرعي", font: almarai },
  { id: "ibmplex-arabic", label: "IBM بلكس عربي", font: ibmPlexArabic },
  { id: "noto-kufi", label: "نوتو كوفي عربي", font: notoKufi },
  { id: "el-messiri", label: "المسيري", font: elMessiri },
  { id: "reem-kufi", label: "ريم كوفي", font: reemKufi },
  { id: "changa", label: "تشانغا", font: changa },
  { id: "alexandria", label: "الإسكندرية", font: alexandria },
  { id: "readex-pro", label: "ريديكس برو", font: readexPro },
  { id: "noto-sans-arabic", label: "نوتو سانس عربي", font: notoSansArabic },
  { id: "mada", label: "مدى", font: mada },
  { id: "vazirmatn", label: "فازيرمتن", font: vazirmatn },
  { id: "baloo-bhaijaan", label: "بالو بهيجان", font: balooBhaijaan },
  { id: "harmattan", label: "هارماتان", font: harmattan },
  { id: "lemonada", label: "ليموناضة", font: lemonada },
] as const;

// Display (headings/logo) font options.
export const DISPLAY_FONTS = [
  { id: "playfair", label: "بلاي فير ديسبلاي (الافتراضي)", font: playfair },
  { id: "cormorant", label: "كورمورانت غارامون", font: cormorant },
  { id: "marcellus", label: "مارسيلوس", font: marcellus },
  { id: "amiri", label: "أميري", font: amiri },
  { id: "markazi", label: "مركزي تكست", font: markaziText },
  { id: "aref-ruqaa", label: "عارف رقعة", font: arefRuqaa },
  { id: "lalezar", label: "لاليزار", font: lalezar },
  { id: "el-messiri-display", label: "المسيري", font: elMessiri },
  { id: "rakkas", label: "رقاص", font: rakkas },
  { id: "mirza", label: "ميرزا", font: mirza },
  { id: "noto-naskh-arabic", label: "نوتو نسخ عربي", font: notoNaskhArabic },
  { id: "italiana", label: "إيطاليانا", font: italiana },
  { id: "prata", label: "براتا", font: prata },
  { id: "bodoni-moda", label: "بودوني مودا", font: bodoniModa },
  { id: "jomhuria", label: "جمهورية", font: jomhuria },
  { id: "katibeh", label: "كاتبة", font: katibeh },
] as const;

const allFontVariables = [
  tajawal.variable,
  playfair.variable,
  cairo.variable,
  cormorant.variable,
  almarai.variable,
  marcellus.variable,
  ibmPlexArabic.variable,
  amiri.variable,
  notoKufi.variable,
  elMessiri.variable,
  reemKufi.variable,
  changa.variable,
  markaziText.variable,
  arefRuqaa.variable,
  alexandria.variable,
  readexPro.variable,
  notoSansArabic.variable,
  mada.variable,
  vazirmatn.variable,
  balooBhaijaan.variable,
  harmattan.variable,
  lemonada.variable,
  rakkas.variable,
  mirza.variable,
  notoNaskhArabic.variable,
  italiana.variable,
  prata.variable,
  bodoniModa.variable,
  jomhuria.variable,
  katibeh.variable,
  lalezar.variable,
].join(" ");

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
  icons: {
    icon: "/favicon-velisia.svg",
    shortcut: "/favicon-velisia.svg",
    apple: "/favicon-velisia.svg",
  },
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["fonts", "theme"]));
  const fontsRow = rows.find((r) => r.key === "fonts");
  const themeRow = rows.find((r) => r.key === "theme");
  const shippingSettings = await getShippingSettings();

  const fontsData = fontsRow?.value as
    | { bodyFontId?: string; displayFontId?: string }
    | undefined;
  const activeBody =
    BODY_FONTS.find((f) => f.id === fontsData?.bodyFontId) || BODY_FONTS[0];
  const activeDisplay =
    DISPLAY_FONTS.find((f) => f.id === fontsData?.displayFontId) || DISPLAY_FONTS[0];

  const savedTheme = themeRow?.value as Partial<Theme> | undefined;
  const theme: Theme = {
    ...defaultTheme,
    ...savedTheme,
    blush: mergeShades(defaultTheme.blush, savedTheme?.blush),
    plum: mergeShades(defaultTheme.plum, savedTheme?.plum),
    accent: mergeShades(defaultTheme.accent, savedTheme?.accent),
    nude: mergeShades(defaultTheme.nude, savedTheme?.nude),
    roseGold: mergeShades(defaultTheme.roseGold, savedTheme?.roseGold),
    wine: mergeShades(defaultTheme.wine, savedTheme?.wine),
    success: { ...defaultTheme.success, ...savedTheme?.success },
    error: { ...defaultTheme.error, ...savedTheme?.error },
    warning: { ...defaultTheme.warning, ...savedTheme?.warning },
  };

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
        {/* Runtime font override: @theme's --font-sans/--font-display don't
            resolve reliably across the html→body cascade boundary in Tailwind
            v4, so we set the literal resolved font stack here instead. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --font-sans: ${activeBody.font.style.fontFamily}, system-ui, sans-serif !important; --font-display: ${activeDisplay.font.style.fontFamily}, Georgia, serif !important; }`,
          }}
        />
        {/* Runtime theme colors — see buildThemeCss for why gradient
            utilities need explicit from/via/to color overrides too. */}
        <style dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }} />
      </head>
      <body className={`${allFontVariables} font-sans antialiased`}>
        <AccountProvider>
          <CartProvider
            shippingFee={shippingSettings.fee}
            freeShippingThreshold={shippingSettings.freeThreshold}
          >
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