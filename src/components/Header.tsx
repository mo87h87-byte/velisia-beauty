"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAccount } from "@/lib/account-context";
import { CATEGORIES } from "@/lib/constants";

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
  const router = useRouter();
  const pathname = usePathname();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar */}
      <div className="bg-gradient-to-l from-plum-900 via-blush-800 to-plum-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <IconTruck /> توصيل مجاني للطلبات فوق ٣٠٠ ر.س
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">🛡️ منتجات أصلية ١٠٠٪</span>
          <span className="hidden items-center gap-1.5 md:flex">🎁 تغليف فاخر لكل طلب</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-blush-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Mobile menu btn */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="القائمة"
            className="grid h-10 w-10 place-items-center rounded-full text-plum-900 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center leading-none">
            <span className="brand-logo text-xl font-bold sm:text-2xl">velisiabeauty</span>
            <span className="mt-0.5 text-[9px] tracking-[0.3em] text-rose-gold">
              BEAUTY & CARE
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={submitSearch}
            className="mx-auto hidden max-w-md flex-1 items-center md:flex"
          >
            <div className="relative w-full">
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
            <Link href="/account" className="hidden flex-col items-center px-2 text-plum-900 transition hover:text-blush-600 sm:flex">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
              <span className="mt-0.5 max-w-[64px] truncate text-[10px]">
                {customer ? customer.name.split(" ")[0] : "حسابي"}
              </span>
            </Link>

            <button className="relative hidden flex-col items-center px-2 text-plum-900 transition hover:text-blush-600 sm:flex">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              <span className="mt-0.5 text-[10px]">المفضلة</span>
              <span className="absolute -top-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-blush-500 text-[9px] font-bold text-white">2</span>
            </button>

            <button
              onClick={openCart}
              className="relative flex flex-col items-center px-2 text-plum-900 transition hover:text-blush-600"
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
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-b border-blush-100 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <form onSubmit={submitSearch} className="mb-4">
              <div className="relative">
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
