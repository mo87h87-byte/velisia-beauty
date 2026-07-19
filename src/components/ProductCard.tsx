"use client";

import Link from "next/link";
import StarRating from "@/components/StarRating";
import WishlistButton from "@/components/WishlistButton";
import ProductQuickActions from "@/components/ProductQuickActions";

export interface ProductCardProps {
  id: number | string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  image: string;
  link?: string;
}

export default function ProductCard({
  id,
  slug,
  name,
  brand,
  price,
  oldPrice,
  discount,
  rating,
  image,
  link,
}: ProductCardProps) {
  return (
    <Link
      href={link || `/products/${slug}`}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-[0_10px_24px_-8px_rgba(88,28,80,0.25)] ring-1 ring-black/5 transition hover:-translate-y-1.5 hover:shadow-[0_18px_32px_-8px_rgba(88,28,80,0.35)]"
    >
      {discount && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-2 py-1 text-xs font-bold text-white shadow-[0_4px_10px_-2px_rgba(236,72,153,0.6)]">
          خصم {discount}%
        </span>
      )}

      <WishlistButton
        productId={String(id)}
        className="absolute left-2 top-2 z-10 h-8 w-8"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={name}
        className="mb-2 h-32 w-full rounded-xl bg-blush-50 object-cover"
      />

      <span className="text-xs font-bold text-plum-900 md:text-sm">
        {name}
      </span>

      <div className="mt-1">
        <StarRating rating={rating} size={12} />
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="font-bold text-blush-600">{price} ريال</span>
        {oldPrice && (
          <span className="text-xs text-plum-900/40 line-through">
            {oldPrice} ريال
          </span>
        )}
      </div>

      <ProductQuickActions
        productId={String(id)}
        productName={name}
        productSlug={slug}
        productBrand={brand}
        productPrice={price}
        productImage={image}
        className="mt-2 border-t border-plum-900/5 pt-2"
      />
    </Link>
  );
}