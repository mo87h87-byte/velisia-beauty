// Default homepage content (hero slides, promo banners) used as a fallback
// when the corresponding `settings` DB row doesn't exist yet, and as the
// starting point shown in the admin "Site Settings" images editor.

export type HeroSlide = {
  id: number;
  badge?: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
};

const makeupImg =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80&auto=format&fit=crop";
const skincareHeroImg =
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&q=80&auto=format&fit=crop";
const perfumeHeroImg =
  "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80&auto=format&fit=crop";

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 1,
    badge: "👑",
    title: "جمالك يستحق الأفضل",
    subtitle: "اكتشفي منتجات أصلية مختارة بعناية لبشرة أكثر إشراقاً وجمالاً",
    primaryButtonText: "تسوقي الآن",
    primaryButtonLink: "/products",
    secondaryButtonText: "اكتشفي العروض",
    secondaryButtonLink: "/products?category=offers",
    image: makeupImg,
  },
  {
    id: 2,
    badge: "✨",
    title: "إشراقة تدوم طوال اليوم",
    subtitle: "منتجات العناية بالبشرة الأكثر مبيعاً لبشرة نضرة ومشرقة",
    primaryButtonText: "تسوقي الآن",
    primaryButtonLink: "/products?category=skincare",
    secondaryButtonText: "اكتشفي العروض",
    secondaryButtonLink: "/products?category=offers",
    image: skincareHeroImg,
  },
  {
    id: 3,
    badge: "🌷",
    title: "عبيرٌ يبقى معكِ",
    subtitle: "مجموعة حصرية من العطور الفاخرة التي ترافقكِ في كل لحظة",
    primaryButtonText: "تسوقي الآن",
    primaryButtonLink: "/products?category=perfume",
    secondaryButtonText: "اكتشفي العروض",
    secondaryButtonLink: "/products?category=offers",
    image: perfumeHeroImg,
  },
];

export type PromoBanner = {
  id: number;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bgColor?: string;
};

const giftImg =
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80&auto=format&fit=crop";
const truckImg =
  "https://images.unsplash.com/photo-1535655685871-dc8158ff167e?w=500&q=80&auto=format&fit=crop";

export type SiteText = {
  tickerLabel: string;
  tickerItems: string[];
  categoriesTitle: string;
  bestsellersTitle: string;
  featuresTitle: string;
  testimonialsTitle: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
};

export const defaultSiteText: SiteText = {
  tickerLabel: "📣 آخر الأخبار",
  tickerItems: [
    "🚚 شحن مجاني للطلبات فوق 199 ريال",
    "🎁 هدية مجانية مع كل طلب فوق 300 ريال",
    "🔥 خصم 40% على جميع منتجات العناية بالبشرة",
  ],
  categoriesTitle: "تسوقي حسب الفئة",
  bestsellersTitle: "الأكثر مبيعاً",
  featuresTitle: "لماذا Velisia Beauty؟",
  testimonialsTitle: "آراء عملائنا",
  newsletterTitle: "كوني أول من يعرف بالعروض الجديدة",
  newsletterSubtitle: "اشتركي في نشرتنا البريدية واحصلي على خصم 10% على أول طلب",
};

export type ColorShades = {
  "50": string;
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
};

export type FunctionalColor = {
  light: string;
  base: string;
  dark: string;
};

const SHADE_KEY_LIST: (keyof ColorShades)[] = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

/**
 * Merges a saved shade group over the defaults, picking only known shade
 * keys. Older saved themes stored some of these fields as a single hex
 * string (e.g. `roseGold: "#b76e79"`); naively spreading that string would
 * scatter its characters into numeric-keyed properties, so anything that
 * isn't a valid shade value is ignored instead.
 */
export function mergeShades(base: ColorShades, saved: unknown): ColorShades {
  const result: ColorShades = { ...base };
  if (saved && typeof saved === "object") {
    const record = saved as Record<string, unknown>;
    for (const key of SHADE_KEY_LIST) {
      const value = record[key];
      if (typeof value === "string") result[key] = value;
    }
  }
  return result;
}

export type Theme = {
  blush: ColorShades;
  plum: ColorShades;
  accent: ColorShades;
  nude: ColorShades;
  roseGold: ColorShades;
  wine: ColorShades;
  champagne: string;
  gold: string;
  background: string;
  text: string;
  success: FunctionalColor;
  error: FunctionalColor;
  warning: FunctionalColor;
};

// Mirrors the @theme color values in src/app/globals.css.
export const defaultTheme: Theme = {
  blush: {
    "50": "#fdf5f6",
    "100": "#fbe9ec",
    "200": "#f7d4db",
    "300": "#f0b3c0",
    "400": "#e58aa0",
    "500": "#d1207f",
    "600": "#a80f5c",
    "700": "#a13755",
    "800": "#862f49",
    "900": "#722a41",
  },
  plum: {
    "50": "#fbf3f5",
    "100": "#f5e3e8",
    "200": "#ecc9d3",
    "300": "#dba0b2",
    "400": "#c06f8c",
    "500": "#9c4869",
    "600": "#7a3454",
    "700": "#5e2740",
    "800": "#4a2233",
    "900": "#200a1c",
  },
  accent: {
    "50": "#f6f4fb",
    "100": "#ece7f7",
    "200": "#d9cbef",
    "300": "#bfa8e3",
    "400": "#9f7ed2",
    "500": "#7c56bd",
    "600": "#63419c",
    "700": "#4f3480",
    "800": "#402a67",
    "900": "#2a1b44",
  },
  nude: {
    "50": "#fdfbf8",
    "100": "#faf5ee",
    "200": "#f3e8d9",
    "300": "#e8d5bc",
    "400": "#d7bd9a",
    "500": "#c2a179",
    "600": "#a3835d",
    "700": "#806549",
    "800": "#5f4b38",
    "900": "#3c2f24",
  },
  roseGold: {
    "50": "#faf5f6",
    "100": "#f3e7e9",
    "200": "#e6ccd0",
    "300": "#d3a6ad",
    "400": "#c48791",
    "500": "#b76e79",
    "600": "#a14f5b",
    "700": "#82404a",
    "800": "#633138",
    "900": "#3e1e23",
  },
  wine: {
    "50": "#fbeef1",
    "100": "#f6d9df",
    "200": "#eab0bd",
    "300": "#d97e94",
    "400": "#c14f6d",
    "500": "#8f1d3f",
    "600": "#7a1735",
    "700": "#63122b",
    "800": "#4a0e21",
    "900": "#300916",
  },
  champagne: "#f3e4d6",
  gold: "#c9a86a",
  background: "#fdf5f6",
  text: "#200a1c",
  success: {
    light: "#dcfce7",
    base: "#16a34a",
    dark: "#166534",
  },
  error: {
    light: "#fee2e2",
    base: "#dc2626",
    dark: "#991b1b",
  },
  warning: {
    light: "#fef9c3",
    base: "#ca8a04",
    dark: "#854d0e",
  },
};

/**
 * Builds a runtime CSS override for the palette. Plain `:root` variables
 * cover solid bg-/text-/border-/ring- utilities. The `.from-*`/`.via-*`/`.to-*`
 * class overrides are also needed because Tailwind v4's oklab gradient
 * interpolation resolves `--tw-gradient-from/via/to` once and does not
 * reliably re-resolve through `var(--color-*)` at runtime.
 */
export function buildThemeCss(theme: Theme): string {
  const shadeGroups: [string, ColorShades][] = [
    ["blush", theme.blush],
    ["plum", theme.plum],
    ["accent", theme.accent],
    ["nude", theme.nude],
    ["rose-gold", theme.roseGold],
    ["wine", theme.wine],
  ];

  const gradientTokens: { name: string; value: string }[] = [
    ...shadeGroups.flatMap(([groupName, shades]) =>
      (Object.entries(shades) as [string, string][]).map(([shade, value]) => ({
        name: `${groupName}-${shade}`,
        value,
      }))
    ),
    { name: "champagne", value: theme.champagne },
    { name: "gold", value: theme.gold },
  ];

  const plainTokens: { name: string; value: string }[] = [
    { name: "site-bg", value: theme.background },
    { name: "site-text", value: theme.text },
    // Bare `rose-gold` (no shade suffix) backs existing `text-rose-gold` utility classes.
    { name: "rose-gold", value: theme.roseGold["500"] },
    { name: "success", value: theme.success.base },
    { name: "success-light", value: theme.success.light },
    { name: "success-dark", value: theme.success.dark },
    { name: "error", value: theme.error.base },
    { name: "error-light", value: theme.error.light },
    { name: "error-dark", value: theme.error.dark },
    { name: "warning", value: theme.warning.base },
    { name: "warning-light", value: theme.warning.light },
    { name: "warning-dark", value: theme.warning.dark },
  ];

  const rootVars = [...gradientTokens, ...plainTokens]
    .map((t) => `--color-${t.name}: ${t.value} !important;`)
    .join(" ");

  const gradientRules = gradientTokens
    .map(
      (t) =>
        `.from-${t.name}{--tw-gradient-from:${t.value} !important;}.via-${t.name}{--tw-gradient-via:${t.value} !important;}.to-${t.name}{--tw-gradient-to:${t.value} !important;}`
    )
    .join("");

  return `:root{${rootVars}}${gradientRules}`;
}

function placeholderImage(label: string, from: string, to: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${from}'/>
        <stop offset='100%' stop-color='${to}'/>
      </linearGradient>
    </defs>
    <rect width='500' height='500' rx='28' fill='url(#g)'/>
    <circle cx='250' cy='190' r='90' fill='#ffffff' fill-opacity='0.14'/>
    <circle cx='250' cy='190' r='55' fill='#ffffff' fill-opacity='0.18'/>
    <text x='50%' y='60%' font-family='Arial, sans-serif' font-size='30' fill='#ffffff' fill-opacity='0.95' text-anchor='middle' font-weight='bold'>${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export type CategoryItem = {
  id: number;
  name: string;
  icon: string;
  link: string;
};

export const defaultCategories: CategoryItem[] = [
  { id: 1, name: "المكياج", icon: placeholderImage("مكياج", "#fda4af", "#9f1239"), link: "/products?category=makeup" },
  { id: 2, name: "العناية بالشعر", icon: placeholderImage("شعر", "#f0abfc", "#a21caf"), link: "/products?category=haircare" },
  { id: 3, name: "العناية بالبشرة", icon: placeholderImage("بشرة", "#f9a8d4", "#be185d"), link: "/products?category=skincare" },
  { id: 4, name: "الأظافر", icon: placeholderImage("أظافر", "#f9a8d4", "#831843"), link: "/products?category=nails" },
  { id: 5, name: "العناية بالجسم", icon: placeholderImage("جسم", "#fbcfe8", "#9d174d"), link: "/products?category=body-care" },
];

export type FeatureItem = {
  id: number;
  icon: string;
  title: string;
  description: string;
};

export const defaultFeatures: FeatureItem[] = [
  { id: 1, icon: "📦", title: "استرجاع سهل", description: "خلال 3 أيام" },
  { id: 2, icon: "🚚", title: "شحن سريع", description: "إلى جميع مناطق المملكة" },
  { id: 3, icon: "💳", title: "دفع آمن", description: "وسائل دفع متعددة" },
  { id: 4, icon: "🏅", title: "منتجات أصلية", description: "من أشهر الماركات العالمية" },
];

export type SectionId =
  | "hero"
  | "ticker"
  | "categories"
  | "promo_banners"
  | "bestsellers"
  | "features"
  | "promo_video"
  | "testimonials"
  | "newsletter";

export const sectionLabels: Record<SectionId, { label: string; icon: string }> = {
  hero: { label: "البانر الرئيسي (الهيرو)", icon: "🌟" },
  ticker: { label: "شريط الأخبار المتحرك", icon: "📣" },
  categories: { label: "الفئات", icon: "🗂️" },
  promo_banners: { label: "البانرات الترويجية", icon: "🎯" },
  bestsellers: { label: "الأكثر مبيعاً", icon: "🛍️" },
  features: { label: "لماذا Velisia Beauty؟", icon: "👑" },
  promo_video: { label: "الفيديو الترويجي", icon: "🎬" },
  testimonials: { label: "آراء العملاء", icon: "💬" },
  newsletter: { label: "النشرة البريدية", icon: "✉️" },
};

export const defaultSectionOrder: SectionId[] = [
  "hero",
  "ticker",
  "categories",
  "promo_banners",
  "bestsellers",
  "features",
  "promo_video",
  "testimonials",
  "newsletter",
];

export type SectionLayout = {
  order: SectionId[];
  hidden: SectionId[];
};

export const defaultSectionLayout: SectionLayout = {
  order: defaultSectionOrder,
  hidden: [],
};

/**
 * Reconciles a saved section layout with the current default section list:
 * drops ids that no longer exist, and appends any new ids that shipped after
 * the layout was saved (so newly added sections don't silently disappear).
 */
export function resolveSectionLayout(saved: unknown): SectionLayout {
  const record = saved && typeof saved === "object" ? (saved as Partial<SectionLayout>) : undefined;
  const validIds = new Set<SectionId>(defaultSectionOrder);

  const savedOrder = Array.isArray(record?.order)
    ? record.order.filter((id): id is SectionId => validIds.has(id as SectionId))
    : [];
  const missing = defaultSectionOrder.filter((id) => !savedOrder.includes(id));
  const order = [...savedOrder, ...missing];

  const hidden = Array.isArray(record?.hidden)
    ? record.hidden.filter((id): id is SectionId => validIds.has(id as SectionId))
    : [];

  return { order, hidden };
}

export const defaultPromoBanners: PromoBanner[] = [
  {
    id: 1,
    title: "خصومات تصل إلى 50%",
    subtitle: "تشكيلة مختارة من منتجات العناية",
    buttonText: "تسوقي الآن",
    buttonLink: "/products?category=offers",
    image: giftImg,
  },
  {
    id: 2,
    title: "شحن مجاني",
    subtitle: "للطلبات فوق 199 ريال",
    buttonText: "تسوقي الآن",
    buttonLink: "/products",
    image: truckImg,
  },
];
