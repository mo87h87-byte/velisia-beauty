"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

const WISHLIST_KEY = "velisia_wishlist";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(getWishlist().includes(productId));

    const handleUpdate = () => {
      setIsWishlisted(getWishlist().includes(productId));
    };

    window.addEventListener("wishlist-updated", handleUpdate);
    return () => window.removeEventListener("wishlist-updated", handleUpdate);
  }, [productId]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const current = getWishlist();
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    saveWishlist(updated);
    setIsWishlisted(!isWishlisted);
  };

  return (
    <button
      onClick={toggleWishlist}
      aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className={`flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors ${className}`}
    >
      <Heart
        size={18}
        className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-500"}
      />
    </button>
  );
}