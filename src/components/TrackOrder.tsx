"use client";

import { useState } from "react";
import { formatPrice, formatArabicDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/order-status";

interface TrackedItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}
interface TrackedOrder {
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  city: string;
  total: string;
  createdAt: string;
  items: TrackedItem[];
}

const timeline = ["new", "processing", "shipped", "delivered"];
const timelineIcons: Record<string, string> = {
  new: "📝",
  processing: "📦",
  shipped: "🚚",
  delivered: "✅",
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!orderNumber.trim()) {
      setError("يرجى إدخال رقم الطلب");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? timeline.indexOf(order.status) : -1;

  return (
    <div>
      <form onSubmit={track} className="rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8">
        <label className="mb-2 block text-sm font-semibold text-plum-900">رقم الطلب</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="مثال: VLS-12345678"
            className="w-full rounded-full border border-blush-200 bg-white px-5 py-3 text-sm outline-none focus:border-blush-400"
            dir="ltr"
          />
          <button
            disabled={loading}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            تتبّعي الطلب
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <p className="mt-3 text-xs text-plum-900/50">
          💡 تجدين رقم الطلب في رسالة التأكيد أو صفحة نجاح الطلب.
        </p>
      </form>

      {order && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-plum-900/60">رقم الطلب</p>
                <p className="font-display text-2xl font-bold text-blush-600">{order.orderNumber}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-plum-900/60">تاريخ الطلب</p>
                <p className="font-semibold text-plum-900">{formatArabicDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
                ⛔ تم إلغاء هذا الطلب
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  {timeline.map((step, i) => {
                    const reached = i <= currentStep;
                    return (
                      <div key={step} className="flex flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          {i > 0 && (
                            <div className={`h-1 flex-1 ${i <= currentStep ? "bg-blush-500" : "bg-blush-100"}`} />
                          )}
                          <div
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition ${
                              reached
                                ? "bg-gradient-to-l from-blush-500 to-blush-600 text-white shadow"
                                : "bg-blush-100 text-plum-900/40"
                            }`}
                          >
                            {timelineIcons[step]}
                          </div>
                          {i < timeline.length - 1 && (
                            <div className={`h-1 flex-1 ${i < currentStep ? "bg-blush-500" : "bg-blush-100"}`} />
                          )}
                        </div>
                        <span className={`mt-2 text-center text-[11px] font-semibold ${reached ? "text-blush-600" : "text-plum-900/40"}`}>
                          {ORDER_STATUS_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-blush-50 pt-5 text-sm">
              <span className="rounded-full bg-blush-50 px-3 py-1.5 font-semibold text-blush-700">
                الحالة: {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="rounded-full bg-blush-50 px-3 py-1.5 font-semibold text-blush-700">
                الدفع: {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </span>
              <span className="rounded-full bg-blush-50 px-3 py-1.5 font-semibold text-blush-700">
                المدينة: {order.city}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-4 font-bold text-plum-900">تفاصيل الطلب</h3>
            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm text-plum-900">{it.name}</p>
                    <p className="text-xs text-plum-900/50">{it.quantity} × {formatPrice(it.price)}</p>
                  </div>
                  <span className="text-sm font-semibold text-blush-600">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-dashed border-blush-200 pt-4 font-extrabold text-plum-900">
              <span>الإجمالي</span>
              <span className="text-blush-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


