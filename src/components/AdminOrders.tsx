"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/db/schema";
import { formatPrice, formatArabicDate } from "@/lib/format";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUSES,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-status";

interface OrderItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/data");
        if (res.status === 401) {
          clearAdminToken();
          window.location.assign("/admin");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const patch = async (id: number, body: Record<string, string>) => {
    const res = await adminFetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    }
  };

  const remove = async (id: number) => {
    setDeleting(id);
    try {
      const res = await adminFetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        setExpanded((prev) => (prev === id ? null : prev));
      }
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  if (!loaded) {
    return (
      <div className="grid place-items-center py-20">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-plum-900">الطلبات</h1>
        <p className="text-sm text-plum-900/60">{orders.length} طلب</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${filter === "all" ? "bg-blush-500 text-white" : "bg-white text-plum-900/70 border border-blush-100"}`}
        >
          الكل ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${filter === s ? "bg-blush-500 text-white" : "bg-white text-plum-900/70 border border-blush-100"}`}
            >
              {ORDER_STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-blush-200 bg-white py-16 text-center">
          <span className="text-4xl">📦</span>
          <p className="mt-3 font-bold text-plum-900">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const items = (o.items as OrderItem[]) ?? [];
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-blush-100 bg-white shadow-sm">
                <div className="flex w-full flex-wrap items-center justify-between gap-3 p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    className="flex flex-1 items-center gap-3 text-right"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-blush-50 text-lg">🧾</span>
                    <div>
                      <p className="font-bold text-blush-600">{o.orderNumber}</p>
                      <p className="text-xs text-plum-900/60">{o.customerName} • {formatArabicDate(o.createdAt)}</p>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_COLORS[o.paymentStatus]}`}>
                      {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                    <span className="font-extrabold text-plum-900">{formatPrice(o.total)}</span>
                    <button
                      onClick={() => setConfirmDelete(o.id)}
                      title="حذف الطلب"
                      className="grid h-8 w-8 place-items-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      🗑️
                    </button>
                    <button onClick={() => setExpanded(isOpen ? null : o.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-plum-900/40 transition ${isOpen ? "rotate-180" : ""}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {confirmDelete === o.id && (
                  <div className="flex items-center justify-between gap-3 border-t border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-semibold text-red-700">
                      متأكدة من حذف الطلب {o.orderNumber}؟ لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => remove(o.id)}
                        disabled={deleting === o.id}
                        className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                      >
                        {deleting === o.id ? "جاري الحذف..." : "تأكيد الحذف"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {isOpen && (
                  <div className="border-t border-blush-50 bg-blush-50/40 p-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                      {/* Customer */}
                      <div className="rounded-xl bg-white p-4 text-sm">
                        <h3 className="mb-2 font-bold text-plum-900">بيانات العميل</h3>
                        <p className="text-plum-900/70">👤 {o.customerName}</p>
                        <p className="text-plum-900/70" dir="ltr">📱 {o.phone}</p>
                        <p className="text-plum-900/70" dir="ltr">✉️ {o.email}</p>
                        <p className="mt-1 text-plum-900/70">📍 {o.city}، {o.address}</p>
                        {o.notes && <p className="mt-1 text-plum-900/60">📝 {o.notes}</p>}
                        <p className="mt-2 text-xs text-plum-900/50">
                          طريقة الدفع: {PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="rounded-xl bg-white p-4 text-sm lg:col-span-2">
                        <h3 className="mb-2 font-bold text-plum-900">المنتجات ({items.length})</h3>
                        <div className="space-y-2">
                          {items.map((it) => (
                            <div key={it.id} className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={it.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="line-clamp-1 text-plum-900">{it.name}</p>
                                <p className="text-xs text-plum-900/50">{it.quantity} × {formatPrice(it.price)}</p>
                              </div>
                              <span className="font-semibold text-blush-600">{formatPrice(it.price * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 border-t border-blush-50 pt-3 text-xs">
                          <div className="flex justify-between text-plum-900/60"><span>المجموع الفرعي</span><span>{formatPrice(o.subtotal)}</span></div>
                          <div className="flex justify-between text-plum-900/60"><span>الشحن</span><span>{Number(o.shipping) === 0 ? "مجاني" : formatPrice(o.shipping)}</span></div>
                          <div className="flex justify-between font-bold text-plum-900"><span>الإجمالي</span><span>{formatPrice(o.total)}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white p-4">
                      <label className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-plum-900">حالة الطلب:</span>
                        <select
                          value={o.status}
                          onChange={(e) => patch(o.id, { status: e.target.value })}
                          className="rounded-lg border border-blush-200 px-3 py-1.5 text-sm outline-none focus:border-blush-400"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-plum-900">حالة الدفع:</span>
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => patch(o.id, { paymentStatus: e.target.value })}
                          className="rounded-lg border border-blush-200 px-3 py-1.5 text-sm outline-none focus:border-blush-400"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}