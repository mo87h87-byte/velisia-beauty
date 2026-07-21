"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    setQuantity,
    subtotal,
    shipping,
    total,
  } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        className="fixed inset-0 z-50 bg-plum-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer */}
      <aside
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-blush-50 shadow-2xl transition-transform duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blush-100 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-plum-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            سلة التسوق
            <span className="text-sm font-normal text-plum-900/50">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </h2>
          <button
            onClick={closeCart}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full text-plum-900 transition hover:bg-blush-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-blush-100 text-4xl">
              🛍️
            </div>
            <p className="text-lg font-bold text-plum-900">سلتك فارغة</p>
            <p className="text-sm text-plum-900/60">
              اكتشفي تشكيلتنا الفاخرة وأضيفي منتجاتك المفضلة
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
            >
              ابدئي التسوق
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-blush-100 bg-white px-5 py-3">
              {remaining > 0 ? (
                <p className="text-xs text-plum-900/70">
                  أضيفي بقيمة{" "}
                  <span className="font-bold text-blush-600">
                    {formatPrice(remaining)}
                  </span>{" "}
                  للحصول على شحن مجاني 🚚
                </p>
              ) : (
                <p className="text-xs font-bold text-green-600">
                  🎉 مبروك! حصلتِ على شحن مجاني
                </p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blush-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-blush-400 to-blush-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-blush-100 bg-white p-3"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blush-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] font-bold text-rose-gold">{item.brand}</p>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold text-plum-900"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-blush-200 bg-blush-50">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center text-plum-900 transition hover:text-blush-600"
                          aria-label="إنقاص"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center text-plum-900 transition hover:text-blush-600"
                          aria-label="زيادة"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-blush-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="حذف"
                    className="self-start text-plum-900/40 transition hover:text-red-500"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="space-y-3 border-t border-blush-100 bg-white px-5 py-4">
              <div className="flex justify-between text-sm text-plum-900/70">
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-plum-900/70">
                <span>الشحن</span>
                <span className="font-semibold">
                  {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-blush-200 pt-3 text-base font-extrabold text-plum-900">
                <span>الإجمالي</span>
                <span className="text-blush-600">{formatPrice(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
              >
                إتمام الطلب
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-1 text-center text-xs text-plum-900/60 transition hover:text-blush-600"
              >
                متابعة التسوق
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}