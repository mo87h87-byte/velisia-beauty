"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminToken } from "@/lib/admin-client";

interface RestockItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  stock: number;
  soldLast90Days: number;
  monthlyAvg: number;
  suggestedQty: number;
  daysLeft: number | null;
  urgency: "critical" | "high" | "normal";
}

interface RestockData {
  threshold: number;
  totalItems: number;
  totalUnits: number;
  items: RestockItem[];
}

const URGENCY_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-blush-50 text-plum-900/70 border-blush-200",
};

const URGENCY_LABEL: Record<string, string> = {
  critical: "عاجل",
  high: "قريباً",
  normal: "عادي",
};

export default function AdminRestock() {
  const [data, setData] = useState<RestockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (t: number) => {
    setLoading(true);
    setError("");
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/restock?threshold=${t}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تعذر تحميل القائمة");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(threshold);
  }, [load, threshold]);

  const buildText = () => {
    if (!data || data.items.length === 0) return "";
    const lines = [
      "طلب توريد — Velisia Beauty",
      `التاريخ: ${new Date().toLocaleDateString("en-GB")}`,
      "",
    ];
    data.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name}${it.brand ? ` (${it.brand})` : ""}`);
      lines.push(`   الكمية المطلوبة: ${it.suggestedQty} قطعة`);
    });
    lines.push("");
    lines.push(`إجمالي الأصناف: ${data.totalItems}`);
    lines.push(`إجمالي القطع: ${data.totalUnits}`);
    return lines.join("\n");
  };

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("تعذر النسخ");
    }
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-plum-900">📥 قائمة إعادة التخزين</h1>
          <p className="mt-1 text-xs text-plum-900/60">
            الكميات محسوبة لتغطية شهرين حسب متوسط المبيعات آخر 90 يوم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-plum-900/60">حد المخزون:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="rounded-lg border border-blush-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blush-400"
          >
            {[5, 10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n} قطعة أو أقل
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid place-items-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blush-100 bg-white p-4">
              <p className="text-xs text-plum-900/60">أصناف تحتاج توريد</p>
              <p className="mt-1 text-2xl font-bold text-plum-900">{data.totalItems}</p>
            </div>
            <div className="rounded-2xl border border-blush-100 bg-white p-4">
              <p className="text-xs text-plum-900/60">إجمالي القطع المقترحة</p>
              <p className="mt-1 text-2xl font-bold text-plum-900">{data.totalUnits}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-blush-100 bg-white p-4 sm:col-span-1">
              <p className="text-xs text-plum-900/60">حالة عاجلة</p>
              <p className="mt-1 text-2xl font-bold text-red-500">
                {data.items.filter((i) => i.urgency === "critical").length}
              </p>
            </div>
          </div>

          {data.items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyList}
                className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
              >
                {copied ? "✅ تم النسخ" : "📋 نسخ القائمة"}
              </button>
              <button
                onClick={sendWhatsApp}
                className="rounded-full border border-green-500 px-5 py-2.5 text-sm font-bold text-green-600 transition hover:bg-green-50"
              >
                💬 إرسال واتساب
              </button>
            </div>
          )}

          {data.items.length === 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <p className="text-3xl">✅</p>
              <p className="mt-2 font-semibold text-green-700">
                لا توجد منتجات تحتاج إعادة تخزين
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-blush-100 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-blush-50 text-xs text-plum-900/60">
                  <tr>
                    <th className="p-3 text-right font-normal">المنتج</th>
                    <th className="p-3 text-center font-normal">المخزون</th>
                    <th className="p-3 text-center font-normal">مبيعات/شهر</th>
                    <th className="p-3 text-center font-normal">يكفي لـ</th>
                    <th className="p-3 text-center font-normal">اطلب</th>
                    <th className="p-3 text-center font-normal">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it) => (
                    <tr key={it.id} className="border-t border-blush-50">
                      <td className="p-3">
                        <p className="font-semibold text-plum-900">{it.name}</p>
                        <p className="text-[11px] text-plum-900/50">
                          {it.brand} · {it.category}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold ${
                            it.stock === 0 ? "text-red-500" : "text-plum-900"
                          }`}
                        >
                          {it.stock}
                        </span>
                      </td>
                      <td className="p-3 text-center text-plum-900/70">{it.monthlyAvg}</td>
                      <td className="p-3 text-center text-plum-900/70">
                        {it.daysLeft === null ? "—" : `${it.daysLeft} يوم`}
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded-lg bg-blush-100 px-3 py-1 font-bold text-blush-700">
                          {it.suggestedQty}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${URGENCY_STYLE[it.urgency]}`}
                        >
                          {URGENCY_LABEL[it.urgency]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}