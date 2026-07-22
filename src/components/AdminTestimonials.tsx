"use client";

import { useEffect, useState } from "react";
import { formatArabicDate } from "@/lib/format";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";

type Testimonial = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  isPinned: boolean;
  createdAt: string;
};

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await adminFetch("/api/admin/testimonials");
      if (res.status === 401) {
        clearAdminToken();
        window.location.assign("/admin");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data.testimonials);
      }
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id: number, field: "isVisible" | "isPinned", value: boolean) => {
    setBusyId(id);
    try {
      const res = await adminFetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا الرأي؟")) return;
    setBusyId(id);
    try {
      const res = await adminFetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }
    } finally {
      setBusyId(null);
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
        <h1 className="font-display text-2xl font-bold text-plum-900">آراء العملاء</h1>
        <p className="text-sm text-plum-900/60">{items.length} رأي — وافقي على الآراء لعرضها في الصفحة الرئيسية</p>
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-blush-200 bg-white py-16 text-center">
          <span className="text-4xl">💬</span>
          <p className="mt-3 font-bold text-plum-900">لا توجد آراء بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-100 font-bold text-blush-600">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-plum-900">{t.name}</p>
                    <p className="text-xs text-amber-500">{"★".repeat(t.rating)}</p>
                  </div>
                </div>
                <span className="text-xs text-plum-900/50">{formatArabicDate(t.createdAt)}</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-plum-900/70">{t.comment}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  disabled={busyId === t.id}
                  onClick={() => toggle(t.id, "isVisible", !t.isVisible)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    t.isVisible
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-blush-50 text-blush-600 hover:bg-blush-100"
                  }`}
                >
                  {t.isVisible ? "✅ ظاهر" : "🚫 مخفي"}
                </button>

                <button
                  disabled={busyId === t.id}
                  onClick={() => toggle(t.id, "isPinned", !t.isPinned)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    t.isPinned
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-blush-50 text-blush-600 hover:bg-blush-100"
                  }`}
                >
                  {t.isPinned ? "📌 مثبّت" : "📌 تثبيت"}
                </button>

                <button
                  disabled={busyId === t.id}
                  onClick={() => remove(t.id)}
                  className="mr-auto rounded-lg bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
  );
}