"use client";

import { useState } from "react";
import type { SettingsMap } from "@/components/AdminSettings";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

// Mirrors BODY_FONTS / DISPLAY_FONTS in src/app/layout.tsx (ids must match).
// The literal family names below are only used for the live preview here —
// the actual fonts are loaded once, site-wide, via next/font in layout.tsx.
const BODY_FONT_OPTIONS: { id: string; label: string; family: string }[] = [
  { id: "tajawal", label: "تجوال (الافتراضي)", family: "Tajawal" },
  { id: "cairo", label: "كايرو", family: "Cairo" },
  { id: "almarai", label: "المرعي", family: "Almarai" },
  { id: "ibmplex-arabic", label: "IBM بلكس عربي", family: "IBM Plex Sans Arabic" },
  { id: "noto-kufi", label: "نوتو كوفي عربي", family: "Noto Kufi Arabic" },
  { id: "el-messiri", label: "المسيري", family: "El Messiri" },
  { id: "reem-kufi", label: "ريم كوفي", family: "Reem Kufi" },
  { id: "changa", label: "تشانغا", family: "Changa" },
  { id: "alexandria", label: "الإسكندرية", family: "Alexandria" },
  { id: "readex-pro", label: "ريديكس برو", family: "Readex Pro" },
  { id: "noto-sans-arabic", label: "نوتو سانس عربي", family: "Noto Sans Arabic" },
  { id: "mada", label: "مدى", family: "Mada" },
  { id: "vazirmatn", label: "فازيرمتن", family: "Vazirmatn" },
  { id: "baloo-bhaijaan", label: "بالو بهيجان", family: "Baloo Bhaijaan 2" },
  { id: "harmattan", label: "هارماتان", family: "Harmattan" },
  { id: "lemonada", label: "ليموناضة", family: "Lemonada" },
];

const DISPLAY_FONT_OPTIONS: { id: string; label: string; family: string }[] = [
  { id: "playfair", label: "بلاي فير ديسبلاي (الافتراضي)", family: "Playfair Display" },
  { id: "cormorant", label: "كورمورانت غارامون", family: "Cormorant Garamond" },
  { id: "marcellus", label: "مارسيلوس", family: "Marcellus" },
  { id: "amiri", label: "أميري", family: "Amiri" },
  { id: "markazi", label: "مركزي تكست", family: "Markazi Text" },
  { id: "aref-ruqaa", label: "عارف رقعة", family: "Aref Ruqaa" },
  { id: "lalezar", label: "لاليزار", family: "Lalezar" },
  { id: "el-messiri-display", label: "المسيري", family: "El Messiri" },
  { id: "rakkas", label: "رقاص", family: "Rakkas" },
  { id: "mirza", label: "ميرزا", family: "Mirza" },
  { id: "noto-naskh-arabic", label: "نوتو نسخ عربي", family: "Noto Naskh Arabic" },
  { id: "italiana", label: "إيطاليانا", family: "Italiana" },
  { id: "prata", label: "براتا", family: "Prata" },
  { id: "bodoni-moda", label: "بودوني مودا", family: "Bodoni Moda" },
  { id: "jomhuria", label: "جمهورية", family: "Jomhuria" },
  { id: "katibeh", label: "كاتبة", family: "Katibeh" },
];

export default function AdminFontsPanel({ settings, onSave }: Props) {
  const initial = settings.fonts as
    | { bodyFontId?: string; displayFontId?: string }
    | undefined;
  const [bodyFontId, setBodyFontId] = useState(initial?.bodyFontId || BODY_FONT_OPTIONS[0].id);
  const [displayFontId, setDisplayFontId] = useState(
    initial?.displayFontId || DISPLAY_FONT_OPTIONS[0].id
  );
  const [savedMsg, setSavedMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const bodyFont = BODY_FONT_OPTIONS.find((f) => f.id === bodyFontId) || BODY_FONT_OPTIONS[0];
  const displayFont =
    DISPLAY_FONT_OPTIONS.find((f) => f.id === displayFontId) || DISPLAY_FONT_OPTIONS[0];

  const save = async () => {
    setSaving(true);
    const ok = await onSave("fonts", { bodyFontId, displayFontId });
    setSaving(false);
    setSavedMsg(ok ? "✅ تم الحفظ — أعيدي تحميل الصفحة لرؤية التغيير بكل الموقع" : "❌ فشل الحفظ");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-1 font-bold text-plum-900">خطوط الموقع</h3>
      <p className="mb-4 text-xs text-plum-900/50">
        اختاري خط النص العام وخط العناوين بشكل مستقل من القائمتين
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">خط النص العام</label>
          <select
            value={bodyFontId}
            onChange={(e) => setBodyFontId(e.target.value)}
            className="w-full rounded-lg border border-blush-200 bg-white px-3 py-2 text-sm"
          >
            {BODY_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">خط العناوين</label>
          <select
            value={displayFontId}
            onChange={(e) => setDisplayFontId(e.target.value)}
            className="w-full rounded-lg border border-blush-200 bg-white px-3 py-2 text-sm"
          >
            {DISPLAY_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blush-100 bg-blush-50/40 p-5">
        <p
          className="text-xl font-bold text-plum-900"
          ref={(el) => {
            if (el) el.style.fontFamily = `"${displayFont.family}", Georgia, serif`;
          }}
        >
          جمالك يستحق الأفضل
        </p>
        <p
          className="mt-2 text-sm text-plum-900/70"
          ref={(el) => {
            if (el) el.style.fontFamily = `"${bodyFont.family}", system-ui, sans-serif`;
          }}
        >
          اكتشفي منتجات أصلية مختارة بعناية لبشرة أكثر إشراقاً وجمالاً
        </p>
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
