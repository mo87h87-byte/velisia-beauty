"use client";

import { useState, type ReactNode } from "react";
import {
  type Theme,
  type ColorShades,
  type FunctionalColor,
  defaultTheme,
  mergeShades,
} from "@/lib/site-defaults";
import type { SettingsMap } from "@/components/AdminSettings";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

const SHADES: (keyof ColorShades)[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

function ShadesEditor({
  label,
  shades,
  onChange,
}: {
  label: string;
  shades: ColorShades;
  onChange: (shade: keyof ColorShades, value: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-plum-900">{label}</h4>
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
        {SHADES.map((shade) => (
          <div key={shade} className="flex flex-col items-center gap-1">
            <input
              type="color"
              value={shades[shade]}
              onChange={(e) => onChange(shade, e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-blush-200 p-0.5"
            />
            <span className="text-[10px] text-plum-900/50">{shade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunctionalColorEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FunctionalColor;
  onChange: (field: keyof FunctionalColor, value: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-plum-900">{label}</h4>
      <div className="flex flex-wrap gap-6">
        <SingleColor label="فاتح" value={value.light} onChange={(v) => onChange("light", v)} />
        <SingleColor label="أساسي" value={value.base} onChange={(v) => onChange("base", v)} />
        <SingleColor label="غامق" value={value.dark} onChange={(v) => onChange("dark", v)} />
      </div>
    </div>
  );
}

function ColorGroup({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-blush-100 bg-blush-50/30 p-4">
      <div className="mb-4 flex items-start gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <div>
          <h3 className="text-sm font-bold text-plum-900">{title}</h3>
          {description && <p className="text-xs text-plum-900/50">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function SingleColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 cursor-pointer rounded-lg border border-blush-200 p-0.5"
      />
      <span className="text-sm font-semibold text-plum-900/70">{label}</span>
      <span className="text-xs text-plum-900/40">{value}</span>
    </div>
  );
}

export default function AdminColorsPanel({ settings, onSave }: Props) {
  const initial = settings.theme as Partial<Theme> | undefined;
  const [theme, setTheme] = useState<Theme>(() => ({
    ...defaultTheme,
    ...initial,
    blush: mergeShades(defaultTheme.blush, initial?.blush),
    plum: mergeShades(defaultTheme.plum, initial?.plum),
    accent: mergeShades(defaultTheme.accent, initial?.accent),
    nude: mergeShades(defaultTheme.nude, initial?.nude),
    roseGold: mergeShades(defaultTheme.roseGold, initial?.roseGold),
    wine: mergeShades(defaultTheme.wine, initial?.wine),
    success: { ...defaultTheme.success, ...initial?.success },
    error: { ...defaultTheme.error, ...initial?.error },
    warning: { ...defaultTheme.warning, ...initial?.warning },
  }));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const updateShade = (
    palette: "blush" | "plum" | "accent" | "nude" | "roseGold" | "wine",
    shade: keyof ColorShades,
    value: string
  ) => setTheme((prev) => ({ ...prev, [palette]: { ...prev[palette], [shade]: value } }));

  const updateSingle = (key: "champagne" | "gold" | "background" | "text", value: string) =>
    setTheme((prev) => ({ ...prev, [key]: value }));

  const updateFunctional = (
    key: "success" | "error" | "warning",
    field: keyof FunctionalColor,
    value: string
  ) => setTheme((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const resetToDefaults = async () => {
    setSaving(true);
    setTheme(defaultTheme);
    const ok = await onSave("theme", defaultTheme);
    setSaving(false);
    setSavedMsg(
      ok ? "✅ تمت الاستعادة للإعدادات الافتراضية — أعيدي تحميل الصفحة لرؤية التغيير" : "❌ فشلت الاستعادة"
    );
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const save = async () => {
    setSaving(true);
    const ok = await onSave("theme", theme);
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ — أعيدي تحميل الصفحة لرؤية التغيير" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-plum-900">ألوان الموقع</h3>
          <p className="text-xs text-plum-900/50">تحكّمي بكل درجة لونية بدقة</p>
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

      <div className="space-y-5">
        <ColorGroup icon="🎀" title="الهوية الأساسية" description="اللون الأساسي والثانوي المستخدمان بمعظم الموقع">
          <ShadesEditor
            label="Blush — أساسي (الوردي)"
            shades={theme.blush}
            onChange={(shade, value) => updateShade("blush", shade, value)}
          />
          <ShadesEditor
            label="Plum — ثانوي (الموف الغامق)"
            shades={theme.plum}
            onChange={(shade, value) => updateShade("plum", shade, value)}
          />
        </ColorGroup>

        <ColorGroup icon="✨" title="الألوان الثانوية والتمييز" description="تُستخدم للتمييز، والخلفيات المحايدة، وكروت المنتجات">
          <ShadesEditor
            label="Accent — تمييز (البنفسجي الفاتح)"
            shades={theme.accent}
            onChange={(shade, value) => updateShade("accent", shade, value)}
          />
          <ShadesEditor
            label="Nude / Beige — محايد (خلفيات وكروت المنتجات)"
            shades={theme.nude}
            onChange={(shade, value) => updateShade("nude", shade, value)}
          />
        </ColorGroup>

        <ColorGroup icon="💎" title="التفاصيل الفاخرة والمعدنية" description="تُستخدم معاً في تدرّج شعار الموقع واللمسات الذهبية">
          <ShadesEditor
            label="Rose Gold Metallic — أساسي معدني"
            shades={theme.roseGold}
            onChange={(shade, value) => updateShade("roseGold", shade, value)}
          />
          <div className="flex flex-wrap gap-6">
            <SingleColor label="Gold — ثانوي" value={theme.gold} onChange={(v) => updateSingle("gold", v)} />
            <SingleColor label="Champagne — مساعد" value={theme.champagne} onChange={(v) => updateSingle("champagne", v)} />
          </div>
        </ColorGroup>

        <ColorGroup icon="🛍️" title="التحويل والعروض" description="أزرار الشراء الفعلي (أضيفي للسلة، إتمام الطلب) وشارات الخصم">
          <ShadesEditor
            label="Deep Berry / Wine — أساسي (عنابي غامق)"
            shades={theme.wine}
            onChange={(shade, value) => updateShade("wine", shade, value)}
          />
        </ColorGroup>

        <ColorGroup
          icon="🌊"
          title="الخلفية العامة والتموجات"
          description="خلفية الموقع ولون النص الأساسي — والتدرّج المتحرك والتموّج اللؤلؤي بالصفحة الرئيسية يمزجان تلقائياً بين Gold وChampagne وBlush وWine وAccent أعلاه"
        >
          <div className="flex flex-wrap gap-6">
            <SingleColor
              label="خلفية الموقع — أساسي"
              value={theme.background}
              onChange={(v) => updateSingle("background", v)}
            />
            <SingleColor
              label="لون النص — أساسي"
              value={theme.text}
              onChange={(v) => updateSingle("text", v)}
            />
          </div>
        </ColorGroup>

        <ColorGroup icon="✅" title="الألوان الوظيفية" description="حالات النجاح والخطأ والتنبيه — كل حالة بدرجة فاتحة وأساسية وغامقة">
          <FunctionalColorEditor
            label="نجاح (أخضر)"
            value={theme.success}
            onChange={(field, v) => updateFunctional("success", field, v)}
          />
          <FunctionalColorEditor
            label="خطأ (أحمر)"
            value={theme.error}
            onChange={(field, v) => updateFunctional("error", field, v)}
          />
          <FunctionalColorEditor
            label="تنبيه (أصفر)"
            value={theme.warning}
            onChange={(field, v) => updateFunctional("warning", field, v)}
          />
        </ColorGroup>
      </div>

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
