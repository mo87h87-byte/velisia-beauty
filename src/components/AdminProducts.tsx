"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { formatPrice, toNumber } from "@/lib/format";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";

interface FormState {
  id?: number;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  images: string;
  slug: string;
  isFeatured: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
  isNew: boolean;
}

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "makeup",
  price: "",
  oldPrice: "",
  stock: "50",
  shortDescription: "",
  description: "",
  images: "",
  slug: "",
  isFeatured: false,
  isBestseller: false,
  isRecommended: false,
  isNew: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/products");
        if (res.status === 401) {
          clearAdminToken();
          window.location.assign("/admin");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const filtered = products.filter((p) =>
    `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: String(toNumber(p.price)),
      oldPrice: p.oldPrice ? String(toNumber(p.oldPrice)) : "",
      stock: String(p.stock),
      shortDescription: p.shortDescription,
      description: p.description,
      images: p.images.join("\n"),
      slug: p.slug,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
      isRecommended: p.isRecommended,
      isNew: p.isNew,
    });
    setError("");
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.brand || !form.price) {
      setError("الاسم والماركة والسعر مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const editing = !!form.id;
      const res = await adminFetch(
        editing ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            ...form,
            images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
            oldPrice: form.oldPrice || null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      if (editing) {
        setProducts((prev) => prev.map((p) => (p.id === form.id ? data.product : p)));
      } else {
        setProducts((prev) => [data.product, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفع الصورة");
      setForm((prev) => ({
        ...prev,
        images: prev.images ? `${prev.images}\n${data.url}` : data.url,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-plum-900">المنتجات</h1>
          <p className="text-sm text-plum-900/60">{products.length} منتج</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
        >
          + إضافة منتج
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الماركة..."
          className="w-full max-w-sm rounded-full border border-blush-200 bg-white px-5 py-2.5 text-sm outline-none focus:border-blush-400"
        />
      </div>

      {!loaded && (
        <div className="grid place-items-center py-16">
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
        </div>
      )}

      <div className={`overflow-hidden rounded-2xl border border-blush-100 bg-white shadow-sm ${loaded ? "" : "hidden"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-blush-50 text-xs text-plum-900/60">
              <tr>
                <th className="p-3 font-medium">المنتج</th>
                <th className="p-3 font-medium">الفئة</th>
                <th className="p-3 font-medium">السعر</th>
                <th className="p-3 font-medium">المخزون</th>
                <th className="p-3 font-medium">الحالة</th>
                <th className="p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-blush-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                      <div>
                        <p className="line-clamp-1 font-semibold text-plum-900">{p.name}</p>
                        <p className="text-xs text-rose-gold">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-plum-900/70">{categoryLabel(p.category)}</td>
                  <td className="p-3">
                    <span className="font-bold text-blush-600">{formatPrice(p.price)}</span>
                    {p.oldPrice && (
                      <span className="mr-1 block text-xs text-plum-900/40 line-through">
                        {formatPrice(toNumber(p.oldPrice))}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock <= 25 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isNew && <span className="rounded bg-blush-100 px-1.5 py-0.5 text-[10px] font-bold text-blush-600">جديد</span>}
                      {p.isBestseller && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">الأكثر مبيعاً</span>}
                      {p.isRecommended && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">قد يعجبك</span>}
                      {p.isFeatured && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">مميز</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-600 transition hover:bg-blush-100"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === p.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-plum-900/50">لا توجد منتجات مطابقة</p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plum-900/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-plum-900">
                {form.id ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="إغلاق"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-blush-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="اسم المنتج *">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
                </Field>
                <Field label="الماركة *">
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inp} />
                </Field>
                <Field label="الفئة">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                    {CATEGORIES.filter((c) => c.key !== "offers").map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="الرابط (slug) - اختياري">
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inp} dir="ltr" placeholder="auto-generated" disabled={!!form.id} />
                </Field>
                <Field label="السعر (ر.س) *">
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inp} dir="ltr" />
                </Field>
                <Field label="السعر قبل الخصم - اختياري">
                  <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className={inp} dir="ltr" />
                </Field>
                <Field label="المخزون">
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inp} dir="ltr" />
                </Field>
              </div>
              <Field label="وصف مختصر">
                <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={inp} />
              </Field>
              <Field label="الوصف الكامل">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inp} />
              </Field>
              <Field label="روابط الصور (رابط في كل سطر)">
                <div className="mb-2 flex items-center gap-3">
                  <label className="cursor-pointer rounded-lg bg-blush-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-blush-600">
                    {uploading ? "جاري الرفع..." : "📷 ارفع صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
                </div>
                <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} className={inp} dir="ltr" placeholder="https://..." />
              </Field>
              <div className="flex flex-wrap gap-4">
                {[
                  { k: "isNew" as const, l: "جديد" },
                  { k: "isBestseller" as const, l: "الأكثر مبيعاً" },
                  { k: "isRecommended" as const, l: "منتجات قد تعجبك" },
                  { k: "isFeatured" as const, l: "مميز" },
                ].map((c) => (
                  <label key={c.k} className="flex items-center gap-2 text-sm font-semibold text-plum-900">
                    <input type="checkbox" checked={form[c.k]} onChange={(e) => setForm({ ...form, [c.k]: e.target.checked })} className="h-4 w-4 accent-blush-500" />
                    {c.l}
                  </label>
                ))}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  disabled={saving}
                  className="flex-1 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة المنتج"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-blush-200 px-6 py-3 text-sm font-bold text-plum-900 transition hover:bg-blush-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-blush-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blush-400 disabled:bg-blush-50 disabled:text-plum-900/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-plum-900">{label}</span>
      {children}
    </label>
  );
}