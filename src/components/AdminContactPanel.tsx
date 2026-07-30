"use client";

import { useState } from "react";
import type { SettingsMap } from "@/components/AdminSettings";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

type Channel = { icon: string; title: string; value: string; note?: string };

// كل قناة تواصل مرتبطة بمنطق روابط ثابت في صفحة "تواصلي معنا" (اتصال/إيميل/واتساب/خريطة)
// حسب الأيقونة والعنوان، فالعنوان والأيقونة هنا ثابتين، والقابل للتعديل هو القيمة والملاحظة فقط
const CHANNEL_SLOTS: { icon: string; title: string; placeholder: string; noteholder: string }[] = [
  { icon: "call", title: "اتصلي بنا", placeholder: "05XXXXXXXX", noteholder: "مثال: من ٩ صباحاً حتى ١١ مساءً" },
  { icon: "mail", title: "البريد الإلكتروني", placeholder: "care@velisiabeauty.com", noteholder: "مثال: نرد خلال ٢٤ ساعة" },
  { icon: "whatsapp", title: "واتساب", placeholder: "05XXXXXXXX", noteholder: "مثال: دعم فوري ٢٤/٧" },
  { icon: "location", title: "الموقع", placeholder: "المدينة، الدولة", noteholder: "مثال: المقر الرئيسي" },
];

function buildInitial(settings: SettingsMap): Channel[] {
  const existing = (settings.contact_channels as Channel[] | undefined) ?? [];
  return CHANNEL_SLOTS.map((slot) => {
    const found = existing.find((c) => c.title === slot.title);
    return {
      icon: slot.icon,
      title: slot.title,
      value: found?.value ?? "",
      note: found?.note ?? "",
    };
  });
}

export default function AdminContactPanel({ settings, onSave }: Props) {
  const [channels, setChannels] = useState<Channel[]>(() => buildInitial(settings));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const update = (title: string, patch: Partial<Channel>) =>
    setChannels((prev) => prev.map((c) => (c.title === title ? { ...c, ...patch } : c)));

  const save = async () => {
    setSaving(true);
    try {
      const ok = await onSave("contact_channels", channels);
      setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-1 font-bold text-plum-900">بيانات التواصل</h3>
      <p className="mb-4 text-xs text-plum-900/50">
        هذه البيانات تظهر للعملاء في صفحة &quot;تواصلي معنا&quot;
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHANNEL_SLOTS.map((slot) => {
          const channel = channels.find((c) => c.title === slot.title)!;
          return (
            <div key={slot.title} className="rounded-xl border border-blush-100 bg-blush-50/40 p-4">
              <h4 className="mb-2 text-sm font-bold text-plum-900">{slot.title}</h4>
              <label className="mb-1 block text-xs font-semibold text-plum-900/70">القيمة</label>
              <input
                value={channel.value}
                onChange={(e) => update(slot.title, { value: e.target.value })}
                placeholder={slot.placeholder}
                dir="ltr"
                className="mb-2 w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
              />
              <label className="mb-1 block text-xs font-semibold text-plum-900/70">ملاحظة (اختياري)</label>
              <input
                value={channel.note}
                onChange={(e) => update(slot.title, { note: e.target.value })}
                placeholder={slot.noteholder}
                className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "💾 حفظ"}
        </button>
        {savedMsg && <span className="text-xs font-semibold text-green-600">{savedMsg}</span>}
      </div>
    </div>
  );
}
