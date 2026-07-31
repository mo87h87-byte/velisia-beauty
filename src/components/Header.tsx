"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAccount } from "@/lib/account-context";
import { CATEGORIES } from "@/lib/constants";
import { Headset, ShieldCheck } from "lucide-react";

function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}

export default function Header() {
  const { count, openCart } = useCart();
  const { customer } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const stored = localStorage.getItem("velisia_wishlist");
        const ids = stored ? JSON.parse(stored) : [];
        setWishlistCount(Array.isArray(ids) ? ids.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlist-updated", updateWishlistCount);

    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlist-updated", updateWishlistCount);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className=" w-full">
      {/* Top bar: free shipping message + utility links + language switcher */}
      <div className="bg-gradient-to-l from-plum-900 via-blush-800 to-plum-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <IconTruck /> شحن مجاني للطلبات فوق ٣٠٠ ر.س
          </span>
          <div className="flex items-center gap-4">
            <Link href="/pages/contact" className="hidden items-center gap-1.5 hover:text-white/70 sm:flex">
              <Headset size={14} />
              خدمة العملاء
            </Link>
            <Link href="/pages/track-order" className="hidden items-center gap-1.5 hover:text-white/70 sm:flex">
              <ShieldCheck size={14} />
              تتبع الطلب
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:text-white/70"
              >
                🇸🇦 العربية
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-32 overflow-hidden rounded-lg bg-white text-plum-900 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => setLangOpen(false)}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold hover:bg-blush-50"
                  >
                    <span>🇸🇦 العربية</span>
                    <span className="text-blush-600">✓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLangOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-blush-50"
                  >
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-blush-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Mobile menu btn */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="القائمة"
            className="pearl-ring grid h-10 w-10 place-items-center rounded-full text-plum-900 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="pearl-ring flex items-center gap-2 rounded-2xl px-4 py-1.5 leading-none"
          >
            <Image
              src="/velisia-rose-icon.png"
              alt=""
              width={426}
              height={432}
              priority
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <span className="flex flex-col items-center">
              <span className="brand-logo text-xl font-bold sm:text-2xl">VELISIA</span>
              <span className="mt-0.5 text-[9px] tracking-[0.3em] text-rose-gold">
                BEAUTY
              </span>
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={submitSearch}
            className="mx-auto hidden max-w-md flex-1 items-center md:flex"
          >
            <div className="pearl-ring relative w-full rounded-full">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحثي عن منتج، ماركة أو كلمة..."
                className="w-full rounded-full border border-blush-200 bg-blush-50/60 py-2.5 pr-5 pl-11 text-sm text-plum-900 outline-none transition focus:border-blush-400 focus:bg-white"
              />
              <button
                type="submit"
                aria-label="بحث"
                className="absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-blush-500 text-white transition hover:bg-blush-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="mr-auto flex items-center gap-1 sm:gap-3 md:mr-0">
            <Link
              href="/account"
              className="pearl-ring hidden flex-col items-center rounded-xl px-2 py-1 text-plum-900 transition hover:text-blush-600 sm:flex"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
              <span className="mt-0.5 max-w-[64px] truncate text-[10px]">
                {customer ? customer.name.split(" ")[0] : "حسابي"}
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="pearl-ring relative hidden flex-col items-center rounded-xl px-2 py-1 text-plum-900 transition hover:text-blush-600 sm:flex"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              <span className="mt-0.5 text-[10px]">المفضلة</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-blush-500 px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="pearl-ring relative flex flex-col items-center rounded-xl px-2 py-1 text-plum-900 transition hover:text-blush-600"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="mt-0.5 text-[10px]">السلة</span>
              <span className="absolute -top-1 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-blush-500 px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden border-t border-blush-100 lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4">
            <li>
              <Link
                href="/"
                className="block border-b-2 border-blush-500 px-4 py-3 text-sm font-bold text-blush-600"
              >
                الرئيسية
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/products?category=${c.key}`}
                  className="block border-b-2 border-transparent px-4 py-3 text-sm font-medium text-plum-900/80 transition hover:border-blush-300 hover:text-blush-600"
                >
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/products"
                className="block border-b-2 border-transparent px-4 py-3 text-sm font-medium text-plum-900/80 transition hover:border-blush-300 hover:text-blush-600"
              >
                العلامات التجارية
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-blush-100 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <form onSubmit={submitSearch} className="mb-4">
              <div className="pearl-ring relative rounded-full">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحثي عن منتج..."
                  className="w-full rounded-full border border-blush-200 bg-blush-50/60 py-2.5 pr-5 pl-11 text-sm outline-none focus:border-blush-400"
                />
                <button type="submit" aria-label="بحث" className="absolute left-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-blush-500 text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </button>
              </div>
            </form>
            <ul className="grid grid-cols-2 gap-2">
              <li className="col-span-2">
                <Link href="/" onClick={() => setMenuOpen(false)} className="block rounded-xl bg-blush-50 px-4 py-2.5 text-sm font-bold text-blush-600">
                  الرئيسية
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <Link
                    href={`/products?category=${c.key}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl bg-blush-50/60 px-4 py-2.5 text-sm font-medium text-plum-900"
                  >
                    {c.icon} {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}