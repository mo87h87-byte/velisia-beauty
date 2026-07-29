"use client";

import { useState } from "react";
import {
  type SiteText,
  defaultSiteText,
  type FeatureItem,
  defaultFeatures,
} from "@/lib/site-defaults";
import type { SettingsMap } from "@/components/AdminSettings";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

const fields: { key: keyof SiteText; label: string; multiline?: boolean }[] = [
  { key: "categoriesTitle", label: "عنوان قسم الفئات" },
  { key: "bestsellersTitle", label: "عنوان قسم الأكثر مبيعاً" },
  { key: "featuresTitle", label: "عنوان قسم \"لماذا Velisia Beauty؟\"" },
  { key: "testimonialsTitle", label: "زر/عنوان قسم آراء العملاء" },
  { key: "newsletterTitle", label: "عنوان النشرة البريدية" },
  { key: "newsletterSubtitle", label: "وصف النشرة البريدية" },
  { key: "tickerLabel", label: "تسمية شريط الأخبار" },
];

function nextId(items: { id: number }[]) {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

function SiteTextEditor({ settings, onSave }: Props) {
  const [text, setText] = useState<SiteText>(() => ({
    ...defaultSiteText,
    ...(settings.site_text as Partial<SiteText> | undefined),
  }));
  const [tickerRaw, setTickerRaw] = useState(() => text.tickerItems.join("\n"));
  const [savedMsg, setSavedMsg] = useState("");

  const update = (key: keyof SiteText, value: string) =>
    setText((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const tickerItems = tickerRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const value: SiteText = { ...text, tickerItems: tickerItems.length ? tickerItems : defaultSiteText.tickerItems };
    const ok = await onSave("site_text", value);
    if (ok) setText(value);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-4 font-bold text-plum-900">النصوص الثابتة بالصفحة الرئيسية</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-semibold text-plum-900/70">{f.label}</label>
            <input
              value={text[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-plum-900/70">
          عبارات شريط الأخبار المتحرك (سطر لكل عبارة)
        </label>
        <textarea
          value={tickerRaw}
          onChange={(e) => setTickerRaw(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
        >
          💾 حفظ
        </button>
        {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
      </div>
    </div>
  );
}

function FeaturesEditor({ settings, onSave }: Props) {
  const [items, setItems] = useState<FeatureItem[]>(() => {
    const row = settings.features as { items?: FeatureItem[] } | undefined;
    return row?.items?.length ? row.items : defaultFeatures;
  });
  const [savedMsg, setSavedMsg] = useState("");

  const update = (id: number, patch: Partial<FeatureItem>) =>
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const move = (id: number, delta: number) =>
    setItems((prev) => {
      const i = prev.findIndex((f) => f.id === id);
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (id: number) => setItems((prev) => prev.filter((f) => f.id !== id));

  const add = () =>
    setItems((prev) => [
      ...prev,
      { id: nextId(prev), icon: "✨", title: "ميزة جديدة", description: "وصف مختصر" },
    ]);

  const save = async () => {
    const ok = await onSave("features", { items });
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="mt-6 rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-plum-900">مزايا قسم &quot;لماذا Velisia Beauty؟&quot;</h3>
          <p className="text-xs text-plum-900/50">رتّبي البطاقات بالأسهم — الترتيب هنا هو نفس ترتيب ظهورها بالصفحة الرئيسية</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-700 hover:bg-blush-100"
        >
          ➕ إضافة ميزة
        </button>
      </div>

      <div className="space-y-4">
        {items.map((f, i) => (
          <div key={f.id} className="rounded-xl border border-blush-100 bg-blush-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-plum-900/50">ميزة {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(f.id, -1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === items.length - 1}
                  onClick={() => move(f.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأسفل"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(f.id)}
                  className="mr-1 grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  aria-label="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">العنوان</label>
                <input
                  value={f.title}
                  onChange={(e) => update(f.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">الوصف</label>
                <input
                  value={f.description}
                  onChange={(e) => update(f.id, { description: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
        >
          💾 حفظ
        </button>
        {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
      </div>
    </div>
  );
}

export default function AdminTextPanel({ settings, onSave }: Props) {
  return (
    <div>
      <SiteTextEditor settings={settings} onSave={onSave} />
      <FeaturesEditor settings={settings} onSave={onSave} />
    </div>
  );
}
