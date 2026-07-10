"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "تشكيلة ٢٠٢٦",
    title1: "جمالكِ..",
    title2: "أسلوبكِ الخاص",
    text: "اكتشفي تشكيلة فاخرة من منتجات المكياج والعناية بالبشرة والشعر من أفضل الماركات العالمية",
    cta: "تسوّقي الآن",
    href: "/products",
  },
  {
    eyebrow: "وصل حديثاً",
    title1: "إشراقة",
    title2: "لا تُقاوم",
    text: "منتجات العناية بالبشرة الأكثر مبيعاً لبشرة نضرة ومشرقة طوال اليوم",
    cta: "اكتشفي العناية",
    href: "/products?category=skincare",
  },
  {
    eyebrow: "عطور فاخرة",
    title1: "عبيرٌ",
    title2: "يبقى معكِ",
    text: "مجموعة حصرية من العطور النسائية الراقية التي ترافقكِ في كل لحظة",
    cta: "اكتشفي العطور",
    href: "/products?category=perfume",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  const s = slides[active];

  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-blush-100 via-blush-50 to-champagne">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blush-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-champagne/60 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16 lg:py-20">
        {/* Text */}
        <div key={active} className="animate-fade-up text-center md:text-right">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold tracking-wide text-blush-600 shadow-sm">
            {s.eyebrow}
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-plum-900 sm:text-6xl lg:text-7xl">
            {s.title1}
            <br />
            <span className="text-gold-gradient">{s.title2}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-plum-900/70 md:mr-0">
            {s.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              href={s.href}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blush-300/50 transition hover:shadow-blush-400/60 hover:-translate-y-0.5"
            >
              {s.cta}
              <svg className="transition group-hover:-translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link
              href="/products?category=offers"
              className="rounded-full border border-blush-300 bg-white/60 px-8 py-4 text-sm font-bold text-plum-900 transition hover:bg-white"
            >
              العروض 🏷️
            </Link>
          </div>

          {/* dots */}
          <div className="mt-8 flex justify-center gap-2 md:justify-start">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`شريحة ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-8 bg-blush-500" : "w-2 bg-blush-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative animate-fade-in">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-blush-200 to-champagne blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.png"
              alt="منتجات velisiabeauty للتجميل"
              className="w-full rounded-[2.5rem] object-cover shadow-2xl shadow-blush-300/40 animate-float"
            />
            <div className="absolute -bottom-4 right-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur md:right-6">
              <p className="text-xs text-plum-900/60">تقييم عملائنا</p>
              <p className="flex items-center gap-1 text-sm font-bold text-plum-900">
                ⭐ 4.9 / 5.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
