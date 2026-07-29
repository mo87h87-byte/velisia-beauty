import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { db } from "@/db";
import { settings, testimonials } from "@/db/schema";
import type { Product } from "@/db/schema";
import { getBestsellers } from "@/lib/products";
import { asc, desc, eq } from "drizzle-orm";
import StarRating from "@/components/StarRating";
import WishlistButton from "@/components/WishlistButton";
import ProductQuickActions from "@/components/ProductQuickActions";
import NewsletterForm from "@/components/NewsletterForm";
import TestimonialsSection from "@/components/TestimonialsSection";
import HeroVideo from "@/components/HeroVideo";
import HeroCarousel from "@/components/HeroCarousel";
import { Package, Truck, CreditCard, Award } from "lucide-react";
import {
  type HeroSlide,
  defaultHeroSlides,
  type PromoBanner,
  defaultPromoBanners,
  type SiteText,
  defaultSiteText,
  type SectionId,
  resolveSectionLayout,
  type CategoryItem,
  defaultCategories,
  type FeatureItem,
  defaultFeatures,
} from "@/lib/site-defaults";

export const dynamic = "force-dynamic";


// ---------- Elegant placeholder image generator (used for product fallback images only) ----------
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
const roseBouquetPhoto =
  "https://images.unsplash.com/photo-1610823140365-8d7f1adf01e6?w=700&q=80&auto=format&fit=crop";
const bouquet = roseBouquetPhoto;
const rose1 = roseBouquetPhoto;
const rose2 = roseBouquetPhoto;
const rose3 = roseBouquetPhoto;
const rose4 = roseBouquetPhoto;

const p1 = placeholderImage("زيت شعر", "#f472b6", "#831843");
const p2 = placeholderImage("كريم بشرة", "#f9a8d4", "#9f1239");
const p3 = placeholderImage("عطر", "#c4b5fd", "#581c47");
const p4 = placeholderImage("ظلال عيون", "#fda4af", "#be185d");
const p5 = placeholderImage("سيروم", "#f0abfc", "#6d28d9");
const fallbackProductImg = placeholderImage("منتج", "#f9a8d4", "#831843");

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

const featureLinks = ["/pages/returns", "/pages/faq", "/pages/payment", "/products"];

const featureVisuals = [
  { Icon: Package },
  { Icon: Truck },
  { Icon: CreditCard },
  { Icon: Award },
];

function ProductGrid({ items }: { items: GridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.link || "/products"}
          className="pearl-ring relative flex flex-col overflow-hidden rounded-2xl bg-nude-50 p-3 shadow-[0_14px_28px_-10px_rgba(88,28,80,0.4),0_4px_10px_-4px_rgba(88,28,80,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-blush-100 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_40px_-10px_rgba(88,28,80,0.5),0_8px_18px_-4px_rgba(88,28,80,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] hover:ring-blush-300"
        >
          {item.discount && (
            <span className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-l from-wine-500 to-wine-600 px-2 py-1 text-xs font-bold text-white shadow-[0_4px_10px_-2px_rgba(143,29,63,0.6)]">
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
              className="h-32 w-full rounded-xl bg-nude-100 object-cover shadow-[inset_0_0_0_1px_rgba(88,28,80,0.06)]"
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

  const categoriesRow = allSettings.find((s) => s.key === "categories");
  const categoriesData = categoriesRow?.value as { items?: CategoryItem[] } | undefined;
  const categories = categoriesData?.items?.length ? categoriesData.items : defaultCategories;

  const promoRow = allSettings.find((s) => s.key === "promo_banners");
  const promoData = promoRow?.value as { banners?: PromoBanner[] } | undefined;
  const promoBanners = promoData?.banners?.length ? promoData.banners : defaultPromoBanners;

  const featuresRow = allSettings.find((s) => s.key === "features");
  const featuresData = featuresRow?.value as { items?: FeatureItem[] } | undefined;
  const features = featuresData?.items?.length ? featuresData.items : defaultFeatures;

  const siteTextRow = allSettings.find((s) => s.key === "site_text");
  const siteText: SiteText = { ...defaultSiteText, ...(siteTextRow?.value as Partial<SiteText> | undefined) };

  const layoutRow = allSettings.find((s) => s.key === "section_layout");
  const { order: sectionOrder, hidden: hiddenSections } = resolveSectionLayout(layoutRow?.value);
  const hiddenSet = new Set(hiddenSections);

  const [dbBestsellers, dbTestimonials] = await Promise.all([
    getBestsellers(),
    db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isVisible, true))
      .orderBy(desc(testimonials.isPinned), asc(testimonials.sortOrder), desc(testimonials.createdAt)),
  ]);

  const bestsellers: GridItem[] = dbBestsellers.length
    ? dbBestsellers.map(toGridItem)
    : defaultBestsellers;

  const sectionNodes: Record<SectionId, ReactNode> = {
    hero: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6">
        <HeroCarousel slides={heroSlides} decorImage={bouquet} />
      </section>
    ),
    ticker: (
      <section className="relative z-10 mx-auto mt-6 max-w-7xl px-4">
        <div className="flex items-center gap-4 rounded-2xl border border-blush-100 bg-white px-4 py-2.5 shadow-[0_6px_16px_-8px_rgba(88,28,80,0.15)]">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-plum-900 sm:text-sm">
            {siteText.tickerLabel}
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs text-plum-900/70 sm:text-sm">
              {[...siteText.tickerItems, ...siteText.tickerItems].map((item, i) =>
                item.includes("خصم") ? (
                  <span
                    key={i}
                    className="rounded-full bg-gradient-to-l from-orange-400 to-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(234,88,12,0.5)] sm:text-xs"
                  >
                    {item}
                  </span>
                ) : (
                  <span key={i}>{item}</span>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    ),
    categories: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="text-lg leading-none text-[#d9ad6a] drop-shadow-[0_1px_1px_rgba(120,80,20,0.35)]">👑</span>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blush-300 sm:w-16" />
            <h2 className="text-xl font-extrabold text-plum-900 md:text-2xl">
              {siteText.categoriesTitle}
            </h2>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blush-300 sm:w-16" />
          </div>
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
    ),
    promo_banners: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          {promoBanners.map((banner, i) => (
            <div
              key={banner.id}
              className={`pearl-ring relative flex items-center justify-between overflow-hidden rounded-3xl p-7 transition duration-300 hover:-translate-y-1 ${
                i % 2 === 0
                  ? "bg-gradient-to-br from-[#c94f76] to-[#7a1f4a] text-white shadow-[0_22px_40px_-14px_rgba(88,28,80,0.45),0_6px_14px_-6px_rgba(88,28,80,0.3),inset_0_2px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20 hover:shadow-[0_28px_48px_-14px_rgba(88,28,80,0.5),0_8px_16px_-6px_rgba(88,28,80,0.35),inset_0_2px_0_rgba(255,255,255,0.25)]"
                  : "bg-gradient-to-br from-[#5b2670] to-[#8b3fa8] text-white shadow-[0_22px_40px_-14px_rgba(0,0,0,0.55),0_6px_14px_-6px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.15)] ring-1 ring-white/15 hover:shadow-[0_28px_48px_-14px_rgba(0,0,0,0.6),0_8px_16px_-6px_rgba(0,0,0,0.45),inset_0_2px_0_rgba(255,255,255,0.2)]"
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
                <h3 className="text-xl font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] md:text-2xl">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1 text-sm text-white/80">
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
                {banner.id === 2 && (
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
    ),
    bestsellers: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="text-lg leading-none text-[#d9ad6a] drop-shadow-[0_1px_1px_rgba(120,80,20,0.35)]">👑</span>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blush-300 sm:w-16" />
            <h2 className="text-xl font-extrabold text-plum-900 md:text-2xl">
              {siteText.bestsellersTitle}
            </h2>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blush-300 sm:w-16" />
          </div>
        </div>
        <ProductGrid items={bestsellers} />
      </section>
    ),
    features: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="text-lg leading-none text-[#d9ad6a] drop-shadow-[0_1px_1px_rgba(120,80,20,0.35)]">👑</span>
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blush-300 sm:w-16" />
            <h2 className="text-xl font-extrabold text-plum-900 md:text-2xl">
              {siteText.featuresTitle}
            </h2>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blush-300 sm:w-16" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const visual = featureVisuals[i % featureVisuals.length];
            const Icon = visual.Icon;
            return (
              <Link
                key={feature.id}
                href={featureLinks[i % featureLinks.length]}
                className="group flex items-center justify-between gap-3 rounded-full bg-gradient-to-br from-white to-blush-50 py-2.5 pl-3 pr-5 shadow-[0_10px_20px_-10px_rgba(88,28,80,0.35),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-blush-200 transition duration-300 hover:-translate-y-1 hover:ring-blush-400"
              >
                <span className="text-right">
                  <h3 className="text-sm font-extrabold text-plum-900">{feature.title}</h3>
                  <p className="text-[11px] text-plum-900/55">{feature.description}</p>
                </span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blush-100 text-blush-600 transition group-hover:scale-110">
                  <Icon size={20} strokeWidth={2} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    ),
    promo_video: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] shadow-[0_20px_50px_-15px_rgba(88,28,80,0.55)] ring-1 ring-white/10">
          <HeroVideo src="/videos/velisia-promo.mp4" className="aspect-video w-full" />
        </div>
      </section>
    ),
    testimonials: (
      <TestimonialsSection
        title={siteText.testimonialsTitle}
        items={dbTestimonials.map((t) => ({
          id: t.id,
          name: t.name,
          rating: t.rating,
          comment: t.comment,
        }))}
      />
    ),
    newsletter: (
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        <div className="pearl-ring relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-[#2a1030] via-[#40224a] to-[#2a1030] px-6 py-14 text-center shadow-[0_30px_60px_-20px_rgba(88,28,80,0.6),inset_0_2px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10">
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
            {siteText.newsletterTitle}
          </h2>
          <p className="relative z-10 mt-2 text-sm text-white/80">
            {siteText.newsletterSubtitle}
          </p>
          <div className="relative z-10 mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blush-100 via-blush-200 to-blush-100">
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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
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
            #ffffff 0%, var(--color-accent-100) 12%, var(--color-accent-200) 24%,
            #ffffff 38%, var(--color-blush-100) 52%, var(--color-accent-200) 66%,
            #ffffff 80%, var(--color-accent-100) 100%);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: pearlShimmer 2.2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px var(--color-accent-300)) drop-shadow(0 0 16px var(--color-accent-400));
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
          text-shadow: 0 0 6px #fff, 0 0 12px var(--color-accent-300);
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
              "linear-gradient(120deg, var(--color-gold) 0%, var(--color-champagne) 15%, var(--color-blush-500) 35%, var(--color-wine-700) 55%, var(--color-accent-600) 75%, var(--color-gold) 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 12s ease-in-out infinite",
          }}
        />
      </div>

      {sectionOrder
        .filter((id) => !hiddenSet.has(id))
        .map((id) => (
          <Fragment key={id}>{sectionNodes[id]}</Fragment>
        ))}
    </div>
  );
}

