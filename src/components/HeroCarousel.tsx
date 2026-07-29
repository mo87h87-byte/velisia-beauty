"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function HeroCarousel({
  slides,
  decorImage,
}: {
  slides: HeroSlide[];
  decorImage: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  const hero = slides[active];
  const go = (delta: number) =>
    setActive((a) => (a + delta + slides.length) % slides.length);

  return (
    <div className="pearl-ring relative overflow-hidden rounded-[2rem] bg-gradient-to-bl from-blush-100 via-blush-50 to-champagne shadow-[0_20px_50px_-15px_rgba(88,28,80,0.25)] ring-1 ring-blush-200/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={decorImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 bottom-0 h-64 w-64 rounded-full object-cover opacity-80 md:-left-4 md:h-96 md:w-96"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={decorImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full object-cover opacity-25 blur-[1px] md:h-80 md:w-80"
      />
      <div className="grid items-center gap-6 px-6 py-14 md:grid-cols-2 md:px-14 md:py-20">
        <div key={hero.id} className="animate-fade-up relative z-10 max-w-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={decorImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full object-cover opacity-20 blur-[2px] md:h-96 md:w-96"
          />
          {hero.badge && (
            <span className="pearl-ring relative mb-4 inline-grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-[0_4px_10px_rgba(88,28,80,0.15)]">
              {hero.badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight text-plum-900 md:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 text-base text-plum-900/70 md:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={hero.primaryButtonLink}
              className="pearl-ring relative rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-7 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(236,72,153,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-4px_rgba(236,72,153,0.7)]"
            >
              🛍️ {hero.primaryButtonText}
            </Link>
            {hero.secondaryButtonText && (
              <Link
                href={hero.secondaryButtonLink || "#"}
                className="pearl-ring relative rounded-full border border-blush-300 bg-white/70 px-7 py-3 text-sm font-bold text-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:bg-white"
              >
                ✨ {hero.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-0 -z-10 rounded-full bg-blush-400/20 blur-3xl" />
          <div className="pearl-ring relative mx-auto h-72 w-72 rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.image}
              alt={hero.title}
              className="h-72 w-72 rounded-3xl object-cover shadow-[0_25px_45px_-10px_rgba(88,28,80,0.35)] ring-4 ring-white/70"
            />
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="السابق"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-plum-900 shadow-md transition hover:bg-white md:grid"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="التالي"
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-plum-900 shadow-md transition hover:bg-white md:grid"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="absolute bottom-5 left-8 z-20 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                aria-label={`شريحة ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-8 bg-blush-500" : "w-2 bg-blush-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
