"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Product, Testimonial } from "@/db/schema";
import type { SettingsMap } from "@/components/AdminSettings";
import {
  type SectionId,
  sectionLabels,
  defaultSectionLayout,
  resolveSectionLayout,
  type HeroSlide,
  defaultHeroSlides,
  type CategoryItem,
  defaultCategories,
  type PromoBanner,
  defaultPromoBanners,
  type FeatureItem,
  defaultFeatures,
  type SiteText,
  defaultSiteText,
} from "@/lib/site-defaults";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

// Sections whose homepage content is a list of multiple items (not a single
// block), so they get an expandable inner reorder editor in this panel.
const expandableSections = new Set<SectionId>([
  "hero",
  "ticker",
  "categories",
  "promo_banners",
  "features",
  "bestsellers",
  "testimonials",
]);

/** Generic right/left reorder list for the small item cards inside an expanded section. */
function MiniReorderList<T>({
  items,
  getKey,
  renderPreview,
  onReorder,
}: {
  items: T[];
  getKey: (item: T, index: number) => string | number;
  renderPreview: (item: T, index: number) => ReactNode;
  onReorder: (next: T[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onReorder(next);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          className="flex w-28 flex-col items-center gap-2 rounded-xl border border-blush-100 bg-white p-2.5 text-center"
        >
          {renderPreview(item, index)}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              title="نقل لليمين"
              className="grid h-7 w-7 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50 disabled:opacity-30"
            >
              ➡️
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              title="نقل لليسار"
              className="grid h-7 w-7 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50 disabled:opacity-30"
            >
              ⬅️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSaveBar({
  saving,
  savedMsg,
  onSave,
  label,
}: {
  saving: boolean;
  savedMsg: string;
  onSave: () => void;
  label: string;
}) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-4 py-1.5 text-xs font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
      >
        💾 {label}
      </button>
      {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
    </div>
  );
}

function HeroOrderEditor({ settings, onSave }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const row = settings.hero_slider as { slides?: HeroSlide[] } | undefined;
    return row?.slides?.length ? row.slides : defaultHeroSlides;
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    const ok = await onSave("hero_slider", { slides });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div>
      <MiniReorderList
        items={slides}
        getKey={(s) => s.id}
        renderPreview={(s) => (
          <>
            {s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" className="h-14 w-full rounded-lg object-cover" />
            ) : (
              <span className="grid h-14 w-full place-items-center rounded-lg bg-blush-100 text-xl">
                {s.badge || "🌟"}
              </span>
            )}
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{s.title}</span>
          </>
        )}
        onReorder={setSlides}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب الشرائح" />
    </div>
  );
}

function TickerOrderEditor({ settings, onSave }: Props) {
  const [text] = useState<SiteText>(() => ({
    ...defaultSiteText,
    ...(settings.site_text as Partial<SiteText> | undefined),
  }));
  const [items, setItems] = useState<string[]>(text.tickerItems);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    const ok = await onSave("site_text", { ...text, tickerItems: items });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div>
      <MiniReorderList
        items={items}
        getKey={(_item, index) => index}
        renderPreview={(item) => (
          <span className="line-clamp-3 text-[11px] font-bold text-plum-900">{item}</span>
        )}
        onReorder={setItems}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب العبارات" />
    </div>
  );
}

function CategoriesOrderEditor({ settings, onSave }: Props) {
  const [items, setItems] = useState<CategoryItem[]>(() => {
    const row = settings.categories as { items?: CategoryItem[] } | undefined;
    return row?.items?.length ? row.items : defaultCategories;
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    const ok = await onSave("categories", { items });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div>
      <MiniReorderList
        items={items}
        getKey={(c) => c.id}
        renderPreview={(c) => (
          <>
            {c.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.icon} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-blush-100 text-xl">
                🗂️
              </span>
            )}
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{c.name}</span>
          </>
        )}
        onReorder={setItems}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب الفئات" />
    </div>
  );
}

function PromoBannersOrderEditor({ settings, onSave }: Props) {
  const [banners, setBanners] = useState<PromoBanner[]>(() => {
    const row = settings.promo_banners as { banners?: PromoBanner[] } | undefined;
    return row?.banners?.length ? row.banners : defaultPromoBanners;
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    const ok = await onSave("promo_banners", { banners });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div>
      <MiniReorderList
        items={banners}
        getKey={(b) => b.id}
        renderPreview={(b) => (
          <>
            {b.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.image} alt="" className="h-14 w-full rounded-lg object-cover" />
            ) : (
              <span className="grid h-14 w-full place-items-center rounded-lg bg-blush-100 text-xl">
                🎯
              </span>
            )}
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{b.title}</span>
          </>
        )}
        onReorder={setBanners}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب البانرات" />
    </div>
  );
}

function FeaturesOrderEditor({ settings, onSave }: Props) {
  const [items, setItems] = useState<FeatureItem[]>(() => {
    const row = settings.features as { items?: FeatureItem[] } | undefined;
    return row?.items?.length ? row.items : defaultFeatures;
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    const ok = await onSave("features", { items });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  return (
    <div>
      <MiniReorderList
        items={items}
        getKey={(f) => f.id}
        renderPreview={(f) => (
          <>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-blush-100 text-xl">
              {f.icon}
            </span>
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{f.title}</span>
          </>
        )}
        onReorder={setItems}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب المزايا" />
    </div>
  );
}

function BestsellersOrderEditor() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        const all: Product[] = data.products || [];
        const bestsellers = all
          .filter((p) => p.isBestseller)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setProducts(bestsellers);
      });
  }, []);

  const save = async () => {
    if (!products) return;
    setSaving(true);
    const res = await adminFetch("/api/admin/products/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids: products.map((p) => p.id) }),
    });
    setSaving(false);
    setSavedMsg(res.ok ? "✅ تم الحفظ — أعيدي تحميل الصفحة الرئيسية لرؤية التغيير" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  if (!products) {
    return <p className="text-xs text-plum-900/50">جارٍ التحميل...</p>;
  }
  if (!products.length) {
    return (
      <p className="text-xs text-plum-900/50">
        لا يوجد منتجات مُفعّلة كـ &quot;الأكثر مبيعاً&quot; حالياً — فعّليها من تبويب المنتجات أولاً
      </p>
    );
  }

  return (
    <div>
      <MiniReorderList
        items={products}
        getKey={(p) => p.id}
        renderPreview={(p) => (
          <>
            {p.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0]} alt="" className="h-14 w-full rounded-lg object-cover" />
            ) : (
              <span className="grid h-14 w-full place-items-center rounded-lg bg-blush-100 text-xl">
                🛍️
              </span>
            )}
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{p.name}</span>
          </>
        )}
        onReorder={setProducts}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب المنتجات" />
    </div>
  );
}

function TestimonialsOrderEditor() {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/testimonials")
      .then((res) => (res.ok ? res.json() : { testimonials: [] }))
      .then((data) => {
        const all: Testimonial[] = data.testimonials || [];
        const visible = all
          .filter((t) => t.isVisible)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setItems(visible);
      });
  }, []);

  const save = async () => {
    if (!items) return;
    setSaving(true);
    const res = await adminFetch("/api/admin/testimonials/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids: items.map((t) => t.id) }),
    });
    setSaving(false);
    setSavedMsg(res.ok ? "✅ تم الحفظ — أعيدي تحميل الصفحة الرئيسية لرؤية التغيير" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  if (!items) {
    return <p className="text-xs text-plum-900/50">جارٍ التحميل...</p>;
  }
  if (!items.length) {
    return (
      <p className="text-xs text-plum-900/50">
        لا يوجد آراء عملاء ظاهرة حالياً — فعّلي الظهور من تبويب &quot;آراء العملاء&quot; أولاً
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[11px] text-plum-900/50">
        الآراء المثبّتة 📌 بتفضل بتظهر الأول دايماً، والترتيب هنا بيتحكم في الباقي
      </p>
      <MiniReorderList
        items={items}
        getKey={(t) => t.id}
        renderPreview={(t) => (
          <>
            <span className="grid h-14 w-full place-items-center rounded-lg bg-blush-100 text-xl">
              {t.isPinned ? "📌" : "💬"}
            </span>
            <span className="line-clamp-1 text-[11px] font-bold text-plum-900">{t.name}</span>
          </>
        )}
        onReorder={setItems}
      />
      <MiniSaveBar saving={saving} savedMsg={savedMsg} onSave={save} label="حفظ ترتيب الآراء" />
    </div>
  );
}

export default function AdminLayoutPanel({ settings, onSave }: Props) {
  const initial = resolveSectionLayout(settings.section_layout);
  const [order, setOrder] = useState<SectionId[]>(initial.order);
  const [hidden, setHidden] = useState<Set<SectionId>>(new Set(initial.hidden));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<SectionId>>(new Set());

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null) reorder(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const toggleHidden = (id: SectionId) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpanded = (id: SectionId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const ok = await onSave("section_layout", { order, hidden: [...hidden] });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ — أعيدي تحميل الصفحة الرئيسية لرؤية التغيير" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const resetToDefaults = async () => {
    setSaving(true);
    setOrder(defaultSectionLayout.order);
    setHidden(new Set(defaultSectionLayout.hidden));
    const ok = await onSave("section_layout", defaultSectionLayout);
    setSaving(false);
    setSavedMsg(
      ok ? "✅ تمت الاستعادة للترتيب الافتراضي — أعيدي تحميل الصفحة لرؤية التغيير" : "❌ فشلت الاستعادة"
    );
    setTimeout(() => setSavedMsg(""), 4000);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-plum-900">ترتيب أقسام الصفحة الرئيسية</h3>
          <p className="text-xs text-plum-900/50">
            رتّبي ظهور الأقسام بالأسهم، وأخفي أي قسم مؤقتاً بزر العين — وافتحي أي قسم فيه عدة عناصر لترتيبها من الداخل
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDefaults}
          disabled={saving}
          className="rounded-lg bg-blush-50 px-3 py-1.5 text-xs font-semibold text-blush-700 hover:bg-blush-100 disabled:opacity-60"
        >
          ↺ استعادة الافتراضي
        </button>
      </div>

      <ul className="space-y-2">
        {order.map((id, index) => {
          const meta = sectionLabels[id];
          const isHidden = hidden.has(id);
          const isExpandable = expandableSections.has(id);
          const isExpanded = expanded.has(id);
          return (
            <Fragment key={id}>
              <li
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition ${
                  isHidden ? "border-blush-100 bg-blush-50/30 opacity-50" : "border-blush-100 bg-white"
                } ${dragIndex === index ? "opacity-40" : ""} ${
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? "border-blush-400 bg-blush-50/60"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    draggable
                    onDragStart={handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    title="اسحبي لتغيير الترتيب"
                    className="cursor-grab text-lg leading-none active:cursor-grabbing"
                  >
                    {meta.icon}
                  </span>
                  <span className="text-sm font-bold text-plum-900">{meta.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isExpandable && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(id)}
                      title={isExpanded ? "طي عناصر القسم" : "عرض عناصر القسم للترتيب"}
                      className="grid h-8 w-8 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50"
                    >
                      {isExpanded ? "🔼" : "🔽"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleHidden(id)}
                    title={isHidden ? "إظهار القسم" : "إخفاء القسم"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50"
                  >
                    {isHidden ? "🙈" : "👁️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    title="نقل للأعلى"
                    className="grid h-8 w-8 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50 disabled:opacity-30"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === order.length - 1}
                    title="نقل للأسفل"
                    className="grid h-8 w-8 place-items-center rounded-lg text-plum-900/60 hover:bg-blush-50 disabled:opacity-30"
                  >
                    ⬇️
                  </button>
                </div>
              </li>
              {isExpandable && isExpanded && (
                <li className="rounded-xl border border-dashed border-blush-200 bg-blush-50/20 px-4 py-4">
                  {id === "hero" && <HeroOrderEditor settings={settings} onSave={onSave} />}
                  {id === "ticker" && <TickerOrderEditor settings={settings} onSave={onSave} />}
                  {id === "categories" && <CategoriesOrderEditor settings={settings} onSave={onSave} />}
                  {id === "promo_banners" && (
                    <PromoBannersOrderEditor settings={settings} onSave={onSave} />
                  )}
                  {id === "features" && <FeaturesOrderEditor settings={settings} onSave={onSave} />}
                  {id === "bestsellers" && <BestsellersOrderEditor />}
                  {id === "testimonials" && <TestimonialsOrderEditor />}
                </li>
              )}
            </Fragment>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
        >
          💾 حفظ
        </button>
        {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
      </div>
    </div>
  );
}
