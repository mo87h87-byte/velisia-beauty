"use client";

import { useState } from "react";
import { ShoppingBag, Eye, Repeat, Share2, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface ProductQuickActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
  productBrand: string;
  productPrice: number;
  productImage: string;
  className?: string;
}

export default function ProductQuickActions({
  productId,
  productName,
  productSlug,
  productBrand,
  productPrice,
  productImage,
  className = "",
}: ProductQuickActionsProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    stop(e);
    addItem({
      id: Number(productId),
      slug: productSlug,
      name: productName,
      brand: productBrand,
      price: productPrice,
      image: productImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    stop(e);
    // مكان مستقبلي لفتح نافذة عرض سريع للمنتج
  };

  const handleCompare = (e: React.MouseEvent) => {
    stop(e);
    // مكان مستقبلي لإضافة المنتج لقائمة المقارنة
  };

  const handleShare = (e: React.MouseEvent) => {
    stop(e);
    if (navigator.share) {
      navigator.share({
        title: productName,
        url: `${window.location.origin}/products/${productSlug}`,
      }).catch(() => {});
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={handleAddToCart}
        aria-label="إضافة للسلة"
        className="grid h-7 w-7 place-items-center rounded-full bg-plum-50 text-plum-900/60 transition hover:bg-blush-500 hover:text-white"
      >
        {added ? <Check size={13} /> : <ShoppingBag size={13} />}
      </button>
      <button
        type="button"
        onClick={handleQuickView}
        aria-label="عرض سريع"
        className="grid h-7 w-7 place-items-center rounded-full bg-plum-50 text-plum-900/60 transition hover:bg-blush-500 hover:text-white"
      >
        <Eye size={13} />
      </button>
      <button
        type="button"
        onClick={handleCompare}
        aria-label="مقارنة"
        className="grid h-7 w-7 place-items-center rounded-full bg-plum-50 text-plum-900/60 transition hover:bg-blush-500 hover:text-white"
      >
        <Repeat size={13} />
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="مشاركة"
        className="grid h-7 w-7 place-items-center rounded-full bg-plum-50 text-plum-900/60 transition hover:bg-blush-500 hover:text-white"
      >
        <Share2 size={13} />
      </button>
    </div>
  );
}