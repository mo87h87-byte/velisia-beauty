"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/db/schema";
import { useCart } from "@/lib/cart-context";
import { formatPrice, toNumber, discountPercent } from "@/lib/format";
import StarRating from "./StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [fav, setFav] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-blush-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blush-200/50">
      {/* Badges */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        {product.isNew && (
          <span className="rounded-full bg-blush-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            جديد
          </span>
        )}
        {discount && (
          <span className="rounded-full bg-plum-800 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            -{discount}%
          </span>
        )}
      </div>

      <button
        onClick={() => setFav((v) => !v)}
        aria-label="أضف إلى المفضلة"
        className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-blush-500 shadow backdrop-blur transition hover:bg-white hover:scale-110"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>

      <Link href={`/products/${product.slug}`} className="block overflow-hidden bg-blush-50">
        <div className="aspect-square overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-gold">
          {product.brand}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-1">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold text-plum-900 transition hover:text-blush-600">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating rating={product.rating} size={13} />
          <span className="text-[11px] text-plum-900/50">({product.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-blush-600">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-plum-900/40 line-through">
                {formatPrice(toNumber(product.oldPrice))}
              </span>
            )}
          </div>
          <button
            onClick={() =>
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                price: toNumber(product.price),
                image: product.images[0],
              })
            }
            aria-label="أضف إلى السلة"
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-lg shadow-blush-300/50 transition hover:scale-110 hover:shadow-blush-400/60 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
