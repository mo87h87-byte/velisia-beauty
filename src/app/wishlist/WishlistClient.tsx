"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/db/schema";
import { formatPrice, toNumber } from "@/lib/format";
import WishlistButton from "@/components/WishlistButton";

const WISHLIST_KEY = "velisia_wishlist";

function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function WishlistClient({
  allProducts,
}: {
  allProducts: Product[];
}) {
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const updateList = () => {
      const ids = getWishlistIds();
      const matched = allProducts.filter((p) => ids.includes(String(p.id)));
      setWishlistedProducts(matched);
    };

    updateList();

    window.addEventListener("wishlist-updated", updateList);
    window.addEventListener("storage", updateList);
    return () => {
      window.removeEventListener("wishlist-updated", updateList);
      window.removeEventListener("storage", updateList);
    };
  }, [allProducts]);

  // Avoid a flash of "empty" before localStorage is read on the client
  if (wishlistedProducts === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-plum-900/50">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-plum-900 sm:text-3xl">
        المفضلة
      </h1>
      <p className="mt-1 text-sm text-plum-900/60">
        {wishlistedProducts.length > 0
          ? `لديك ${wishlistedProducts.length} منتج في المفضلة`
          : "لا توجد منتجات في المفضلة بعد"}
      </p>

      {wishlistedProducts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-blush-200 bg-blush-50/50 py-20 text-center">
          <span className="text-5xl">💗</span>
          <p className="text-lg font-bold text-plum-900">مفضلتك فارغة</p>
          <p className="text-sm text-plum-900/60">
            اكتشفي تشكيلتنا وأضيفي منتجاتك المفضلة بالضغط على أيقونة القلب
          </p>
          <Link
            href="/products"
            className="mt-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
          >
            تصفحي المنتجات
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-blush-100 bg-white"
            >
              <WishlistButton
                productId={String(product.id)}
                className="absolute left-2 top-2 z-10 h-9 w-9"
              />
              <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-square overflow-hidden bg-blush-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold text-rose-gold">
                    {product.brand}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-plum-900">
                    {product.name}
                  </p>
                  <p className="mt-1.5 text-sm font-extrabold text-blush-600">
                    {formatPrice(toNumber(product.price))}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}