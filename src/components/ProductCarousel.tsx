"use client";

import { useRef } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "next" | "prev") => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    // RTL: prev = scroll right (positive), next = scroll left (negative)
    el.scrollBy({ left: dir === "next" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("prev")}
        aria-label="السابق"
        className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-blush-200 bg-white text-blush-600 shadow-lg transition hover:bg-blush-500 hover:text-white md:flex lg:-right-5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button
        onClick={() => scroll("next")}
        aria-label="التالي"
        className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-blush-200 bg-white text-blush-600 shadow-lg transition hover:bg-blush-500 hover:text-white md:flex lg:-left-5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div
        ref={ref}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[75%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[23%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
