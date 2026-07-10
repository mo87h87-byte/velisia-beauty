"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";
import { CATEGORIES, SORT_OPTIONS, type SortKey } from "@/lib/constants";
import { toNumber, discountPercent } from "@/lib/format";

interface Props {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
}

const priceRanges = [
  { key: "all", label: "كل الأسعار", min: 0, max: Infinity },
  { key: "u100", label: "أقل من ١٠٠", min: 0, max: 100 },
  { key: "100-200", label: "١٠٠ - ٢٠٠", min: 100, max: 200 },
  { key: "200-500", label: "٢٠٠ - ٥٠٠", min: 200, max: 500 },
  { key: "o500", label: "أكثر من ٥٠٠", min: 500, max: Infinity },
];

export default function ProductsBrowser({
  products,
  initialCategory,
  initialQuery,
}: Props) {
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [priceKey, setPriceKey] = useState("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [onlyOffers, setOnlyOffers] = useState(initialCategory === "offers");
  const [query] = useState(initialQuery ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const range = priceRanges.find((r) => r.key === priceKey)!;
    let list = products.filter((p) => {
      const price = toNumber(p.price);
      if (category !== "all" && category !== "offers" && p.category !== category)
        return false;
      if ((category === "offers" || onlyOffers) && !p.oldPrice) return false;
      if (price < range.min || price > range.max) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.name} ${p.brand} ${p.shortDescription}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return toNumber(a.price) - toNumber(b.price);
        case "price-desc":
          return toNumber(b.price) - toNumber(a.price);
        case "rating":
          return toNumber(b.rating) - toNumber(a.rating);
        case "newest":
          return b.id - a.id;
        default:
          return (
            (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) ||
            toNumber(b.rating) - toNumber(a.rating)
          );
      }
    });
    return list;
  }, [products, category, priceKey, brand, sort, onlyOffers, query]);

  const activeCatLabel =
    category === "all"
      ? "كل المنتجات"
      : CATEGORIES.find((c) => c.key === category)?.label ?? "المنتجات";

  const FilterPanel = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-plum-900">الفئات</h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              setCategory("all");
              setOnlyOffers(false);
            }}
            className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
              category === "all"
                ? "bg-blush-500 font-bold text-white"
                : "text-plum-900/70 hover:bg-blush-50"
            }`}
          >
            كل المنتجات
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setCategory(c.key);
                setOnlyOffers(c.key === "offers");
              }}
              className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
                category === c.key
                  ? "bg-blush-500 font-bold text-white"
                  : "text-plum-900/70 hover:bg-blush-50"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-plum-900">السعر</h3>
        <div className="space-y-1">
          {priceRanges.map((r) => (
            <button
              key={r.key}
              onClick={() => setPriceKey(r.key)}
              className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
                priceKey === r.key
                  ? "bg-blush-100 font-bold text-blush-700"
                  : "text-plum-900/70 hover:bg-blush-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-plum-900">الماركة</h3>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full rounded-xl border border-blush-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blush-400"
        >
          <option value="all">كل الماركات</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-blush-50 px-3 py-2.5 text-sm font-semibold text-plum-900">
        <input
          type="checkbox"
          checked={onlyOffers}
          onChange={(e) => {
            setOnlyOffers(e.target.checked);
            if (e.target.checked && category === "offers") setCategory("all");
          }}
          className="h-4 w-4 accent-blush-500"
        />
        العروض فقط 🏷️
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-plum-900">
          {query ? `نتائج البحث: ${query}` : activeCatLabel}
        </h1>
        <p className="mt-1 text-sm text-plum-900/60">{filtered.length} منتج</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-40 rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            {FilterPanel}
          </div>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 rounded-full border border-blush-200 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              تصفية
            </button>
            <div className="mr-auto flex items-center gap-2">
              <span className="hidden text-sm text-plum-900/60 sm:inline">ترتيب:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-blush-200 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 outline-none focus:border-blush-400"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-blush-200 bg-white py-20 text-center">
              <span className="text-5xl">🔍</span>
              <p className="mt-4 text-lg font-bold text-plum-900">لا توجد منتجات مطابقة</p>
              <p className="mt-1 text-sm text-plum-900/60">جرّبي تعديل خيارات التصفية</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-plum-900/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-plum-900">التصفية</h2>
              <button
                onClick={() => setShowFilters(false)}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-blush-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full rounded-full bg-blush-500 py-3 text-sm font-bold text-white"
            >
              عرض {filtered.length} منتج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


