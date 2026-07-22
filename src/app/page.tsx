import Link from "next/link";
import { db } from "@/db";
import { settings, testimonials } from "@/db/schema";
import type { Product } from "@/db/schema";
import { getBestsellers, getNewArrivals, getRecommended } from "@/lib/products";
import { desc, eq } from "drizzle-orm";
import StarRating from "@/components/StarRating";
import WishlistButton from "@/components/WishlistButton";
import ProductQuickActions from "@/components/ProductQuickActions";
import NewsletterForm from "@/components/NewsletterForm";
import TestimonialsSection from "@/components/TestimonialsSection";
import { RotateCcw, Truck, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// ---------- Elegant placeholder image generator (used for category icons / small avatars only) ----------
function placeholderImage(label: string, from: string, to: string) {
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

// ---------- REAL PHOTOS (replacing the old hand-drawn SVG illustrations) ----------
const makeupImg =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80&auto=format&fit=crop";

const roseBouquetPhoto =
  "https://images.unsplash.com/photo-1610823140365-8d7f1adf01e6?w=700&q=80&auto=format&fit=crop";
const bouquet = roseBouquetPhoto;
const rose1 = roseBouquetPhoto;
const rose2 = roseBouquetPhoto;
const rose3 = roseBouquetPhoto;
const rose4 = roseBouquetPhoto;

const truckImg =
  "https://images.unsplash.com/photo-1535655685871-dc8158ff167e?w=500&q=80&auto=format&fit=crop";

const giftImg =
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80&auto=format&fit=crop";

const iconSkin = placeholderImage("بشرة", "#f9a8d4", "#be185d");
const iconHair = placeholderImage("شعر", "#f0abfc", "#a21caf");
const iconMakeup = placeholderImage("مكياج", "#fda4af", "#9f1239");
const iconPerfume = placeholderImage("عطور", "#c4b5fd", "#6d28d9");
const iconNails = placeholderImage("أظافر", "#f9a8d4", "#831843");
const p1 = placeholderImage("زيت شعر", "#f472b6", "#831843");
const p2 = placeholderImage("كريم بشرة", "#f9a8d4", "#9f1239");
const p3 = placeholderImage("عطر", "#c4b5fd", "#581c47");
const p4 = placeholderImage("ظلال عيون", "#fda4af", "#be185d");
const p5 = placeholderImage("سيروم", "#f0abfc", "#6d28d9");
const fallbackProductImg = placeholderImage("منتج", "#f9a8d4", "#831843");

type HeroSlide = {
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

const defaultHeroSlides: HeroSlide[] = [
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
];

type CategoryItem = {
  id: number;
  name: string;
  icon: string;
  link: string;
};

const defaultCategories: CategoryItem[] = [
  { id: 1, name: "العناية بالبشرة", icon: iconSkin, link: "/products?category=skincare" },
  { id: 2, name: "العناية بالشعر", icon: iconHair, link: "/products?category=hair" },
  { id: 3, name: "المكياج", icon: iconMakeup, link: "/products?category=makeup" },
  { id: 4, name: "العطور", icon: iconPerfume, link: "/products?category=perfume" },
  { id: 5, name: "الأظافر", icon: iconNails, link: "/products?category=nails" },
];

type PromoBanner = {
  id: number;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bgColor?: string;
};

const defaultPromoBanners: PromoBanner[] = [
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

type GridItem = {
  id: number;
  name: string;
  brand: string;
  slug: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  link: string;
};

const defaultBestsellers: GridItem[] = [
  { id: 1, name: "زيت مغذي للشعر", brand: "Velisia Beauty", slug: "product-1", price: 119, oldPrice: 149, discount: 20, rating: 4.5, image: p1, link: "/products/1" },
  { id: 2, name: "كريم مرطب للبشرة", brand: "Velisia Beauty", slug: "product-2", price: 129, rating: 4.8, image: p2, link: "/products/2" },
  { id: 3, name: "عطر نسائي فاخر", brand: "Velisia Beauty", slug: "product-3", price: 329, rating: 5, image: p3, link: "/products/3" },
  { id: 4, name: "باليت ظلال العيون", brand: "Velisia Beauty", slug: "product-4", price: 209, oldPrice: 299, discount: 30, rating: 4.6, image: p4, link: "/products/4" },
  { id: 5, name: "سيروم فيتامين سي", brand: "Velisia Beauty", slug: "product-5", price: 149, oldPrice: 199, discount: 25, rating: 4.7, image: p5, link: "/products/5" },
];

function toGridItem(p: Product): GridItem {
  const price = Number(p.price);
  const oldPrice = p.oldPrice ? Number(p.oldPrice) : undefined;
  const discount =
    oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : undefined;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    slug: p.slug,
    price,
    oldPrice,
    discount,
    rating: Number(p.rating) || 5,
    image: p.images?.[0] || fallbackProductImg,
    link: `/products/${p.slug}`,
  };
}

type FeatureItem = {
  id: number;
  icon: string;
  title: string;
  description: string;
};

const defaultFeatures: FeatureItem[] = [
  { id: 1, icon: "🔄", title: "استرجاع سهل", description: "خلال 14 يوم من الاستلام" },
  { id: 2, icon: "🚚", title: "شحن سريع", description: "لجميع مناطق المملكة" },
  { id: 3, icon: "💳", title: "دفع آمن", description: "وسائل دفع متعددة وآمنة" },
  { id: 4, icon: "✨", title: "منتجات أصلية", description: "من أشهر الماركات العالمية" },
];

const featureLinks = ["/pages/returns", "/pages/faq", "/pages/payment", "/products"];

const featureVisuals = [
  { Icon: RotateCcw, bg: "from-blush-300 to-blush-500", text: "text-white" },
  { Icon: Truck, bg: "from-rose-gold to-gold", text: "text-white" },
  { Icon: ShieldCheck, bg: "from-plum-400 to-plum-700", text: "text-white" },
  { Icon: Sparkles, bg: "from-gold to-blush-600", text: "text-white" },
];

function ProductGrid({ items }: { items: GridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.link || "/products"}
          className="pearl-ring relative flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-[0_14px_28px_-10px_rgba(88,28,80,0.4),0_4px_10px_-4px_rgba(88,28,80,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-blush-100 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_40px_-10px_rgba(88,28,80,0.5),0_8px_18px_-4px_rgba(88,28,80,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] hover:ring-blush-300"
        >
          {item.discount && (
            <span className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-2 py-1 text-xs font-bold text-white shadow-[0_4px_10px_-2px_rgba(236,72,153,0.6)]">
              خصم {item.discount}%
            </span>
          )}
          <WishlistButton
            productId={String(item.id)}
            className="absolute left-2 top-2 z-10 h-8 w-8"
          />
          <div className="pearl-ring relative mb-2 h-32 w-full rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              className="h-32 w-full rounded-xl bg-blush-50 object-cover shadow-[inset_0_0_0_1px_rgba(88,28,80,0.06)]"
            />
          </div>
          <span className="text-xs font-bold text-plum-900 md:text-sm">
            {item.name}
          </span>
          <div className="mt-1">
            <StarRating rating={item.rating} size={12} />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-bold text-blush-600">{item.price} ريال</span>
            {item.oldPrice && (
              <span className="text-xs text-plum-900/40 line-through">
                {item.oldPrice} ريال
              </span>
            )}
          </div>
          <ProductQuickActions
            productId={String(item.id)}
            productName={item.name}
            productSlug={item.slug}
            productBrand={item.brand}
            productPrice={item.price}
            productImage={item.image}
            className="mt-2 border-t border-plum-900/5 pt-2"
          />
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const allSettings = await db.select().from(settings);

  const heroRow = allSettings.find((s) => s.key === "hero_slider");
  const heroData = heroRow?.value as { slides?: HeroSlide[] } | undefined;
  const heroSlides = heroData?.slides?.length ? heroData.slides : defaultHeroSlides;
  const hero = heroSlides[0];

  const categoriesRow = allSettings.find((s) => s.key === "categories");
  const categoriesData = categoriesRow?.value as { items?: CategoryItem[] } | undefined;
  const categories = categoriesData?.items?.length ? categoriesData.items : defaultCategories;

  const promoRow = allSettings.find((s) => s.key === "promo_banners");
  const promoData = promoRow?.value as { banners?: PromoBanner[] } | undefined;
  const promoBanners = promoData?.banners?.length ? promoData.banners : defaultPromoBanners;

  const featuresRow = allSettings.find((s) => s.key === "features");
  const featuresData = featuresRow?.value as { items?: FeatureItem[] } | undefined;
  const features = featuresData?.items?.length ? featuresData.items : defaultFeatures;

  const [dbBestsellers, dbNewArrivals, dbRecommended, dbTestimonials] = await Promise.all([
    getBestsellers(),
    getNewArrivals(),
    getRecommended(),
    db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isVisible, true))
      .orderBy(desc(testimonials.isPinned), desc(testimonials.createdAt)),
  ]);

  const bestsellers: GridItem[] = dbBestsellers.length
    ? dbBestsellers.map(toGridItem)
    : defaultBestsellers;

  const newArrivals: GridItem[] = dbNewArrivals.length
    ? dbNewArrivals.map(toGridItem)
    : defaultBestsellers;

  const recommended: GridItem[] = dbRecommended.length
    ? dbRecommended.map(toGridItem)
    : defaultBestsellers;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-50 via-white to-blush-50">
      {/* Animated luxury background + pearl shimmer ring system */}
     <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pearlShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pearlTwinkle {
          0%, 100% { opacity: .25; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .pearl-ring {
          position: relative;
        }
        .pearl-ring::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          padding: 3px;
          background: linear-gradient(100deg,
            #ffffff 0%, #f6e6ff 12%, #e0c3fc 24%,
            #ffffff 38%, #ffd9ee 52%, #c9a8ff 66%,
            #ffffff 80%, #f6e6ff 100%);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: pearlShimmer 2.2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(230,180,255,0.75)) drop-shadow(0 0 16px rgba(200,150,255,0.4));
          pointer-events: none;
          z-index: 5;
        }
        .pearl-ring::after {
          content: "✦";
          position: absolute;
          top: -9px;
          right: 4px;
          font-size: 11px;
          line-height: 1;
          color: #fff;
          text-shadow: 0 0 6px #fff, 0 0 12px #d9b3ff;
          animation: pearlTwinkle 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 6;
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, #f3b45c 0%, #f6d9a0 15%, #e0577e 35%, #7a1f3d 55%, #8b3a8f 75%, #f3b45c 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6">
        <div className="pearl-ring relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-plum-900 via-blush-800 to-rose-gold shadow-[0_20px_50px_-15px_rgba(88,28,80,0.55)] ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bouquet}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 bottom-0 h-64 w-64 rounded-full object-cover opacity-90 md:-left-4 md:h-96 md:w-96"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rose2}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full object-cover opacity-25 blur-[1px] md:h-80 md:w-80"
          />
          <div className="grid items-center gap-6 px-6 py-14 md:grid-cols-2 md:px-14 md:py-20">
            <div className="relative z-10 max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={roseBouquetPhoto}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full object-cover opacity-25 blur-[2px] md:h-96 md:w-96"
              />
              {hero.badge && (
                <span className="pearl-ring relative mb-4 inline-grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.35)]">
                  {hero.badge}
                </span>
              )}
              <h1 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)] md:text-5xl">
                {hero.title}
              </h1>
              <p className="mt-4 text-base text-white/85 md:text-lg">
                {hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={hero.primaryButtonLink}
                  className="pearl-ring relative rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-7 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(236,72,153,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-4px_rgba(236,72,153,0.7)]"
                >
                  {hero.primaryButtonText}
                </Link>
                {hero.secondaryButtonText && (
                  <Link
                    href={hero.secondaryButtonLink || "#"}
                    className="pearl-ring relative rounded-full border border-white/40 bg-white/5 px-7 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-white/15"
                  >
                    {hero.secondaryButtonText}
                  </Link>
                )}
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 -z-10 rounded-full bg-blush-400/30 blur-3xl" />
              <div className="pearl-ring relative mx-auto h-72 w-72 rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.image}
                  alt={hero.title}
                  className="h-72 w-72 rounded-3xl object-cover shadow-[0_25px_45px_-10px_rgba(0,0,0,0.5)] ring-4 ring-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-center">
          <h2 className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-7 py-3 text-xl font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 md:text-2xl">
            تسوقي حسب الفئة
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 sm:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <span
                className="pearl-ring relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-blush-300 via-blush-500 to-plum-700 p-[4px] shadow-[0_16px_28px_-8px_rgba(190,24,93,0.55),0_4px_8px_-2px_rgba(88,28,80,0.35),inset_0_2px_2px_rgba(255,255,255,0.5)] ring-1 ring-white/50 transition duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_24px_36px_-8px_rgba(190,24,93,0.6),0_6px_12px_-2px_rgba(88,28,80,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)]"
              >
                <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white p-1 shadow-[inset_0_3px_8px_rgba(88,28,80,0.25),inset_0_-2px_4px_rgba(255,255,255,0.8)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    className="h-full w-full rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
                  />
                </span>
              </span>
              <span className="text-xs font-bold text-plum-900 transition group-hover:text-blush-600 md:text-sm">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banners */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          {promoBanners.map((banner, i) => (
            <div
              key={banner.id}
              className={`pearl-ring relative flex items-center justify-between overflow-hidden rounded-3xl p-7 transition duration-300 hover:-translate-y-1 ${
                i % 2 === 0
                  ? "bg-gradient-to-br from-blush-100 to-blush-200 shadow-[0_22px_40px_-14px_rgba(88,28,80,0.45),0_6px_14px_-6px_rgba(88,28,80,0.3),inset_0_2px_0_rgba(255,255,255,0.7)] ring-1 ring-white/60 hover:shadow-[0_28px_48px_-14px_rgba(88,28,80,0.5),0_8px_16px_-6px_rgba(88,28,80,0.35),inset_0_2px_0_rgba(255,255,255,0.8)]"
                  : "bg-gradient-to-br from-plum-800 to-plum-900 text-white shadow-[0_22px_40px_-14px_rgba(0,0,0,0.55),0_6px_14px_-6px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.15)] ring-1 ring-white/15 hover:shadow-[0_28px_48px_-14px_rgba(0,0,0,0.6),0_8px_16px_-6px_rgba(0,0,0,0.45),inset_0_2px_0_rgba(255,255,255,0.2)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={i % 2 === 0 ? rose2 : rose1}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -left-6 -top-8 h-32 w-32 rounded-full object-cover opacity-30 blur-[0.5px]"
              />
              <div className="relative z-10 max-w-[60%]">
                <h3
                  className={`text-xl font-extrabold md:text-2xl ${
                    i % 2 === 0 ? "text-plum-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]" : "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className={`mt-1 text-sm ${i % 2 === 0 ? "text-plum-900/70" : "text-white/80"}`}>
                    {banner.subtitle}
                  </p>
                )}
                <Link
                  href={banner.buttonLink}
                  className="pearl-ring relative mt-5 inline-block rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-4px_rgba(236,72,153,0.6)] transition hover:-translate-y-0.5"
                >
                  {banner.buttonText}
                </Link>
              </div>
              <div className="pearl-ring relative z-10 h-28 w-28 rounded-2xl md:h-32 md:w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-full w-full rounded-2xl object-cover shadow-[0_12px_20px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-white/30"
                />
                {banner.image === truckImg && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-plum-900 shadow-sm md:text-[10px]">
                    VELISIA BEAUTY
                  </span>
                )}
              </div>
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-center">
          <h2 className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-7 py-3 text-xl font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 md:text-2xl">
            الأكثر مبيعاً
          </h2>
        </div>
        <ProductGrid items={bestsellers} />
      </section>

      {/* New Arrivals */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-center">
          <h2 className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-7 py-3 text-xl font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 md:text-2xl">
            جديد وصل حديثاً
          </h2>
        </div>
        <ProductGrid items={newArrivals} />
      </section>

      {/* Recommended */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-center">
          <h2 className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-7 py-3 text-xl font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 md:text-2xl">
            منتجات قد يعجبك
          </h2>
        </div>
        <ProductGrid items={recommended} />
      </section>

      {/* Why Velisia */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-center">
          <h2 className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-7 py-3 text-xl font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 md:text-2xl">
            لماذا Velisia Beauty؟
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {features.map((feature, i) => {
            const visual = featureVisuals[i % featureVisuals.length];
            const Icon = visual.Icon;
            return (
              <Link
                key={feature.id}
                href={featureLinks[i % featureLinks.length]}
                className="pearl-ring group relative flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-white to-blush-50 p-6 text-center shadow-[0_16px_32px_-12px_rgba(88,28,80,0.4),0_4px_10px_-4px_rgba(88,28,80,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-blush-200 transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_40px_-12px_rgba(88,28,80,0.5),0_8px_16px_-4px_rgba(88,28,80,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] hover:ring-blush-400"
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${visual.bg} shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),0_8px_16px_-4px_rgba(88,28,80,0.45)] ring-1 ring-white/40 transition group-hover:scale-110`}
                >
                  <Icon size={26} className={visual.text} strokeWidth={2} />
                </span>
                <h3 className="font-extrabold text-plum-900">{feature.title}</h3>
                <p className="text-sm text-plum-900/60">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection
        items={dbTestimonials.map((t) => ({
          id: t.id,
          name: t.name,
          rating: t.rating,
          comment: t.comment,
        }))}
      />

      {/* Newsletter */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        <div className="pearl-ring relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-plum-900 via-blush-800 to-rose-gold px-6 py-14 text-center shadow-[0_30px_60px_-20px_rgba(88,28,80,0.6),inset_0_2px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rose1}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-12 -top-14 h-56 w-56 rounded-full object-cover opacity-35 md:h-72 md:w-72"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rose3}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rounded-full object-cover opacity-25 md:h-80 md:w-80"
          />
          <h2 className="relative z-10 text-xl font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] md:text-2xl">
            كوني أول من يعرف بالعروض الجديدة
          </h2>
          <p className="relative z-10 mt-2 text-sm text-white/80">
            اشتركي في نشرتنا البريدية واحصلي على خصم 10% على أول طلب
          </p>
          <div className="relative z-10 mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}