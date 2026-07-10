"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Review } from "@/db/schema";
import { useCart } from "@/lib/cart-context";
import { formatPrice, toNumber, discountPercent, formatArabicDate } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import StarRating from "./StarRating";

export default function ProductDetail({
  product,
  reviews: initialReviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "reviews">("desc");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const discount = discountPercent(product.price, product.oldPrice);
  const price = toNumber(product.price);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : toNumber(product.rating);

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price,
        image: product.images[0],
      },
      qty,
    );
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-plum-900/50">
        <a href="/" className="hover:text-blush-600">الرئيسية</a>
        <span>/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-blush-600">
          {categoryLabel(product.category)}
        </a>
        <span>/</span>
        <span className="text-plum-900/80">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl border border-blush-100 bg-white">
            {discount && (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-plum-800 px-3 py-1 text-xs font-bold text-white">
                خصم {discount}%
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                    i === activeImg ? "border-blush-500" : "border-blush-100 opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-rose-gold">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-snug text-plum-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={avgRating} size={16} />
            <span className="text-sm text-plum-900/60">
              {avgRating.toFixed(1)} ({reviews.length} تقييم)
            </span>
          </div>

          <p className="mt-4 text-base leading-relaxed text-plum-900/70">
            {product.shortDescription}
          </p>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-blush-600">
              {formatPrice(price)}
            </span>
            {product.oldPrice && (
              <span className="mb-1 text-lg text-plum-900/40 line-through">
                {formatPrice(toNumber(product.oldPrice))}
              </span>
            )}
            {discount && (
              <span className="mb-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                وفّري {discount}%
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                متوفر في المخزون
              </span>
            ) : (
              <span className="font-semibold text-red-500">غير متوفر حالياً</span>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-blush-200 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-lg text-plum-900 transition hover:text-blush-600"
                aria-label="إنقاص"
              >
                −
              </button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center text-lg text-plum-900 transition hover:text-blush-600"
                aria-label="زيادة"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                handleAdd();
                openCart();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 sm:flex-none sm:px-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              أضيفي إلى السلة
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 rounded-full border-2 border-blush-500 px-6 py-3.5 text-sm font-bold text-blush-600 transition hover:bg-blush-50 sm:flex-none sm:px-10"
            >
              شراء الآن
            </button>
          </div>

          {/* Perks */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-blush-100 bg-white p-4 text-xs sm:grid-cols-3">
            <div className="flex items-center gap-2">🚚 <span>توصيل سريع ١-٣ أيام</span></div>
            <div className="flex items-center gap-2">🛡️ <span>منتج أصلي ١٠٠٪</span></div>
            <div className="flex items-center gap-2">↩️ <span>إرجاع خلال ١٤ يوم</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-2 border-b border-blush-100">
          <button
            onClick={() => setTab("desc")}
            className={`px-5 py-3 text-sm font-bold transition ${
              tab === "desc"
                ? "border-b-2 border-blush-500 text-blush-600"
                : "text-plum-900/60 hover:text-plum-900"
            }`}
          >
            الوصف
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`px-5 py-3 text-sm font-bold transition ${
              tab === "reviews"
                ? "border-b-2 border-blush-500 text-blush-600"
                : "text-plum-900/60 hover:text-plum-900"
            }`}
          >
            التقييمات ({reviews.length})
          </button>
        </div>

        <div className="py-6">
          {tab === "desc" ? (
            <p className="max-w-3xl text-base leading-loose text-plum-900/75">
              {product.description}
            </p>
          ) : (
            <ReviewsBlock
              productId={product.id}
              reviews={reviews}
              avgRating={avgRating}
              onNew={(r) => setReviews((prev) => [r, ...prev])}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsBlock({
  productId,
  reviews,
  avgRating,
  onNew,
}: {
  productId: number;
  reviews: Review[];
  avgRating: number;
  onNew: (r: Review) => void;
}) {
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!author.trim() || !comment.trim() || !title.trim()) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, author, title, comment, rating }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onNew(data.review);
      setAuthor("");
      setTitle("");
      setComment("");
      setRating(5);
      setOpen(false);
    } catch {
      setError("حدث خطأ، حاولي مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="rounded-3xl border border-blush-100 bg-white p-6 text-center">
          <p className="font-display text-5xl font-bold text-plum-900">
            {avgRating.toFixed(1)}
          </p>
          <StarRating rating={avgRating} size={20} className="mt-2 justify-center" />
          <p className="mt-2 text-sm text-plum-900/60">
            بناءً على {reviews.length} تقييم
          </p>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-5 w-full rounded-full bg-blush-500 py-3 text-sm font-bold text-white transition hover:bg-blush-600"
          >
            {open ? "إلغاء" : "أضيفي تقييمك ✍️"}
          </button>
        </div>

        {open && (
          <form
            onSubmit={submit}
            className="mt-4 space-y-3 rounded-3xl border border-blush-100 bg-white p-5"
          >
            <div>
              <label className="mb-1 block text-xs font-semibold text-plum-900">التقييم</label>
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "text-amber-400" : "text-blush-200"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="اسمك"
              className="w-full rounded-xl border border-blush-200 px-4 py-2.5 text-sm outline-none focus:border-blush-400"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان التقييم"
              className="w-full rounded-xl border border-blush-200 px-4 py-2.5 text-sm outline-none focus:border-blush-400"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتبي رأيك عن المنتج..."
              rows={4}
              className="w-full rounded-xl border border-blush-200 px-4 py-2.5 text-sm outline-none focus:border-blush-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </form>
        )}
      </div>

      {/* List */}
      <div className="space-y-4 lg:col-span-2">
        {reviews.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-blush-200 py-16 text-center">
            <span className="text-4xl">💬</span>
            <p className="mt-3 font-bold text-plum-900">لا توجد تقييمات بعد</p>
            <p className="text-sm text-plum-900/60">كوني أول من يقيّم هذا المنتج</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-blush-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-100 text-sm font-bold text-blush-600">
                    {r.author.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-plum-900">{r.author}</p>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                </div>
                <span className="text-xs text-plum-900/40">
                  {formatArabicDate(r.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-plum-900">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum-900/70">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
