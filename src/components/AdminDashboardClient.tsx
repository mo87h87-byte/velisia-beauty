"use client";

import { useEffect, useState } from "react";
import type { AdminData } from "@/lib/admin-types";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";
import { formatPrice, formatArabicDate } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { Order } from "@/db/schema";

export default function AdminDashboardClient({
  onNavigate,
}: {
  onNavigate?: (tab: "dashboard" | "products" | "orders" | "messages") => void;
}) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/data");
        if (res.status === 401) {
          clearAdminToken();
          window.location.assign("/admin");
          return;
        }
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        setError("تعذّر تحميل البيانات");
      }
    })();
  }, []);

  if (error) {
    return <p className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">{error}</p>;
  }
  if (!data) {
    return (
      <div className="grid place-items-center py-20">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  const { stats } = data;
  const cards = [
    { label: "إجمالي الإيرادات", value: formatPrice(stats.totalRevenue), icon: "💰", tint: "from-blush-400 to-blush-600" },
    { label: "المبالغ المدفوعة", value: formatPrice(stats.paidRevenue), icon: "✅", tint: "from-emerald-400 to-emerald-600" },
    { label: "عدد الطلبات", value: String(stats.orderCount), icon: "📦", tint: "from-amber-400 to-amber-600" },
    { label: "طلبات جديدة", value: String(stats.newOrders), icon: "🔔", tint: "from-purple-400 to-purple-600" },
  ];

  const daysAgo = (createdAt: Order["createdAt"]) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return days <= 1 ? "منذ يوم" : `منذ ${days} أيام`;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-plum-900">لوحة التحكم</h1>
        <p className="text-sm text-plum-900/60">نظرة عامة على أداء المتجر</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.tint} text-xl`}>
              {c.icon}
            </div>
            <p className="mt-3 text-2xl font-extrabold text-plum-900">{c.value}</p>
            <p className="text-sm text-plum-900/60">{c.label}</p>
          </div>
        ))}
      </div>

      {stats.stalePendingOrders.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-amber-800">
              ⏰ طلبات بانتظار الدفع منذ فترة طويلة ({stats.stalePendingOrders.length})
            </h2>
            <button
              onClick={() => onNavigate?.("orders")}
              className="text-sm font-bold text-amber-700 hover:underline"
            >
              مراجعة الطلبات ←
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.stalePendingOrders.slice(0, 6).map((o) => (
              <div key={o.id} className="rounded-xl bg-white p-3 text-sm">
                <p className="font-bold text-blush-600">{o.orderNumber}</p>
                <p className="text-xs text-plum-900/60">{o.customerName}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">{daysAgo(o.createdAt)}</span>
                  <span className="text-xs font-bold text-plum-900">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-plum-900">أحدث الطلبات</h2>
              <button
                onClick={() => onNavigate?.("orders")}
                className="text-sm font-bold text-blush-600 hover:underline"
              >
                عرض الكل ←
              </button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-plum-900/50">لا توجد طلبات بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-blush-100 text-xs text-plum-900/50">
                      <th className="pb-2 font-medium">رقم الطلب</th>
                      <th className="pb-2 font-medium">العميل</th>
                      <th className="pb-2 font-medium">المبلغ</th>
                      <th className="pb-2 font-medium">الحالة</th>
                      <th className="pb-2 font-medium">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-blush-50 last:border-0">
                        <td className="py-3 font-bold text-blush-600">{o.orderNumber}</td>
                        <td className="py-3 text-plum-900">{o.customerName}</td>
                        <td className="py-3 font-semibold text-plum-900">{formatPrice(o.total)}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-blush-50 px-2.5 py-1 text-xs font-semibold text-blush-700">
                            {ORDER_STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-plum-900/50">{formatArabicDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-plum-900">⚠️ مخزون منخفض</h2>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-plum-900/50">كل المنتجات بمخزون جيد ✓</p>
            ) : (
              <ul className="space-y-2">
                {stats.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="line-clamp-1 text-plum-900/80">{p.name}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${p.stock <= 20 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {p.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-plum-900">المنتجات حسب الفئة</h2>
            <ul className="space-y-2.5">
              {stats.topCategories.map((c) => (
                <li key={c.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-plum-900/80">{categoryLabel(c.category)}</span>
                    <span className="font-bold text-plum-900">{c.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-blush-400 to-blush-600"
                      style={{ width: `${(c.count / stats.productCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}