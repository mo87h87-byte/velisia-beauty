"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import {
  type HeroSlide,
  defaultHeroSlides,
  type PromoBanner,
  defaultPromoBanners,
  type CategoryItem,
  defaultCategories,
} from "@/lib/site-defaults";
import type { SettingsMap } from "@/components/AdminSettings";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

function nextId(items: { id: number }[]) {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.url as string) || null;
}

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const url = await uploadImage(file);
    setUploading(false);
    if (url) onChange(url);
    else setError("فشل رفع الصورة");
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-plum-900/70">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl bg-blush-50 object-cover ring-1 ring-blush-100"
          />
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-blush-300 bg-blush-50 px-3 py-2 text-xs font-semibold text-blush-700 transition hover:bg-blush-100">
          {uploading ? "جارٍ الرفع..." : "📤 رفع صورة"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SaveBar({
  onSave,
  savedMsg,
}: {
  onSave: () => void;
  savedMsg: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
      >
        💾 حفظ
      </button>
      {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
    </div>
  );
}

function HeroSlidesEditor({ settings, onSave }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const row = settings.hero_slider as { slides?: HeroSlide[] } | undefined;
    return row?.slides?.length ? row.slides : defaultHeroSlides;
  });
  const [savedMsg, setSavedMsg] = useState("");

  const update = (id: number, patch: Partial<HeroSlide>) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const move = (id: number, delta: number) =>
    setSlides((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (id: number) => setSlides((prev) => prev.filter((s) => s.id !== id));

  const add = () =>
    setSlides((prev) => [
      ...prev,
      {
        id: nextId(prev),
        badge: "✨",
        title: "عنوان جديد",
        subtitle: "وصف الشريحة",
        primaryButtonText: "تسوقي الآن",
        primaryButtonLink: "/products",
        image: "",
      },
    ]);

  const save = async () => {
    const ok = await onSave("hero_slider", { slides });
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-plum-900">شرائح الهيرو (الصفحة الرئيسية)</h3>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-700 hover:bg-blush-100"
        >
          ➕ إضافة شريحة
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((s, i) => (
          <div key={s.id} className="rounded-xl border border-blush-100 bg-blush-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-plum-900/50">شريحة {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(s.id, -1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === slides.length - 1}
                  onClick={() => move(s.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأسفل"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="mr-1 grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  aria-label="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField
                label="صورة الشريحة"
                value={s.image}
                onChange={(url) => update(s.id, { image: url })}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">الرمز (إيموجي)</label>
                <input
                  value={s.badge || ""}
                  onChange={(e) => update(s.id, { badge: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">العنوان</label>
                <input
                  value={s.title}
                  onChange={(e) => update(s.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">الوصف</label>
                <input
                  value={s.subtitle}
                  onChange={(e) => update(s.id, { subtitle: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">نص الزر الأساسي</label>
                <input
                  value={s.primaryButtonText}
                  onChange={(e) => update(s.id, { primaryButtonText: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">رابط الزر الأساسي</label>
                <input
                  value={s.primaryButtonLink}
                  onChange={(e) => update(s.id, { primaryButtonLink: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">نص الزر الثانوي</label>
                <input
                  value={s.secondaryButtonText || ""}
                  onChange={(e) => update(s.id, { secondaryButtonText: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">رابط الزر الثانوي</label>
                <input
                  value={s.secondaryButtonLink || ""}
                  onChange={(e) => update(s.id, { secondaryButtonLink: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SaveBar onSave={save} savedMsg={savedMsg} />
      </div>
    </div>
  );
}

function PromoBannersEditor({ settings, onSave }: Props) {
  const [banners, setBanners] = useState<PromoBanner[]>(() => {
    const row = settings.promo_banners as { banners?: PromoBanner[] } | undefined;
    return row?.banners?.length ? row.banners : defaultPromoBanners;
  });
  const [savedMsg, setSavedMsg] = useState("");

  const update = (id: number, patch: Partial<PromoBanner>) =>
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const move = (id: number, delta: number) =>
    setBanners((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (id: number) => setBanners((prev) => prev.filter((b) => b.id !== id));

  const add = () =>
    setBanners((prev) => [
      ...prev,
      {
        id: nextId(prev),
        title: "عنوان البانر",
        subtitle: "وصف مختصر",
        buttonText: "تسوقي الآن",
        buttonLink: "/products",
        image: "",
      },
    ]);

  const save = async () => {
    const ok = await onSave("promo_banners", { banners });
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-plum-900">البانرات الترويجية</h3>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-700 hover:bg-blush-100"
        >
          ➕ إضافة بانر
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((b, i) => (
          <div key={b.id} className="rounded-xl border border-blush-100 bg-blush-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-plum-900/50">بانر {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(b.id, -1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === banners.length - 1}
                  onClick={() => move(b.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأسفل"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="mr-1 grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  aria-label="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField
                label="صورة البانر"
                value={b.image}
                onChange={(url) => update(b.id, { image: url })}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">العنوان</label>
                <input
                  value={b.title}
                  onChange={(e) => update(b.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">الوصف</label>
                <input
                  value={b.subtitle || ""}
                  onChange={(e) => update(b.id, { subtitle: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">نص الزر</label>
                <input
                  value={b.buttonText}
                  onChange={(e) => update(b.id, { buttonText: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">رابط الزر</label>
                <input
                  value={b.buttonLink}
                  onChange={(e) => update(b.id, { buttonLink: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SaveBar onSave={save} savedMsg={savedMsg} />
      </div>
    </div>
  );
}

function CategoriesEditor({ settings, onSave }: Props) {
  const [items, setItems] = useState<CategoryItem[]>(() => {
    const row = settings.categories as { items?: CategoryItem[] } | undefined;
    return row?.items?.length ? row.items : defaultCategories;
  });
  const [savedMsg, setSavedMsg] = useState("");

  const update = (id: number, patch: Partial<CategoryItem>) =>
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const move = (id: number, delta: number) =>
    setItems((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (id: number) => setItems((prev) => prev.filter((c) => c.id !== id));

  const add = () =>
    setItems((prev) => [
      ...prev,
      { id: nextId(prev), name: "فئة جديدة", icon: "", link: "/products" },
    ]);

  const save = async () => {
    const ok = await onSave("categories", { items });
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-plum-900">الفئات (قسم &quot;تسوقي حسب الفئة&quot;)</h3>
          <p className="text-xs text-plum-900/50">رتّبي الفئات بالأسهم — الترتيب هنا هو نفس ترتيب ظهورها بالصفحة الرئيسية</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-700 hover:bg-blush-100"
        >
          ➕ إضافة فئة
        </button>
      </div>

      <div className="space-y-4">
        {items.map((c, i) => (
          <div key={c.id} className="rounded-xl border border-blush-100 bg-blush-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-plum-900/50">فئة {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(c.id, -1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === items.length - 1}
                  onClick={() => move(c.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white text-plum-900/60 ring-1 ring-blush-100 disabled:opacity-30"
                  aria-label="تحريك لأسفل"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="mr-1 grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  aria-label="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField
                label="أيقونة الفئة"
                value={c.icon}
                onChange={(url) => update(c.id, { icon: url })}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">اسم الفئة</label>
                <input
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-plum-900/70">الرابط</label>
                <input
                  value={c.link}
                  onChange={(e) => update(c.id, { link: e.target.value })}
                  className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SaveBar onSave={save} savedMsg={savedMsg} />
      </div>
    </div>
  );
}

export default function AdminImagesPanel({ settings, onSave }: Props) {
  return (
    <div className="space-y-6">
      <HeroSlidesEditor settings={settings} onSave={onSave} />
      <PromoBannersEditor settings={settings} onSave={onSave} />
      <CategoriesEditor settings={settings} onSave={onSave} />
    </div>
  );
}
