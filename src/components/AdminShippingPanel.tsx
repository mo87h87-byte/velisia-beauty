"use client";

import { useState } from "react";
import type { SettingsMap } from "@/components/AdminSettings";
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

type Props = {
  settings: SettingsMap;
  onSave: (key: string, value: unknown) => Promise<boolean>;
};

interface ShippingSettingsValue {
  fee: number;
  freeThreshold: number;
}

function buildInitial(settings: SettingsMap): ShippingSettingsValue {
  const existing = settings.shipping_settings as Partial<ShippingSettingsValue> | undefined;
  return {
    fee: typeof existing?.fee === "number" ? existing.fee : SHIPPING_FEE,
    freeThreshold:
      typeof existing?.freeThreshold === "number"
        ? existing.freeThreshold
        : FREE_SHIPPING_THRESHOLD,
  };
}

export default function AdminShippingPanel({ settings, onSave }: Props) {
  const [values, setValues] = useState<ShippingSettingsValue>(() => buildInitial(settings));
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      const ok = await onSave("shipping_settings", values);
      setSavedMsg(ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5">
      <h3 className="mb-1 font-bold text-plum-900">إعدادات الشحن</h3>
      <p className="mb-4 text-xs text-plum-900/50">
        هذه القيم تُستخدم في حساب تكلفة الشحن الفعلية عند إتمام الطلب
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">
            رسوم الشحن (ر.س)
          </label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={values.fee}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, fee: Number(e.target.value) }))
            }
            className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-plum-900/70">
            حد الشحن المجاني (ر.س)
          </label>
          <input
            type="number"
            min={0}
            step="1"
            value={values.freeThreshold}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, freeThreshold: Number(e.target.value) }))
            }
            className="w-full rounded-lg border border-blush-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-plum-900/50">
        الطلبات اللي تفوق حد الشحن المجاني بتوصل بدون رسوم شحن تلقائيًا
      </p>

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
