"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";
import AdminImagesPanel from "@/components/AdminImagesPanel";
import AdminTextPanel from "@/components/AdminTextPanel";
import AdminFontsPanel from "@/components/AdminFontsPanel";
import AdminColorsPanel from "@/components/AdminColorsPanel";
import AdminLayoutPanel from "@/components/AdminLayoutPanel";

export type SettingsMap = Record<string, unknown>;

type SubTab = "images" | "text" | "fonts" | "colors" | "layout";

const subNav: { key: SubTab; label: string; icon: string }[] = [
  { key: "images", label: "الصور", icon: "🖼️" },
  { key: "text", label: "النصوص", icon: "📝" },
  { key: "fonts", label: "الخطوط", icon: "🔤" },
  { key: "colors", label: "الألوان", icon: "🎨" },
  { key: "layout", label: "ترتيب الصفحة", icon: "🧩" },
];

export default function AdminSettings() {
  const [subTab, setSubTab] = useState<SubTab>("images");
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/settings");
      if (res.status === 401) {
        clearAdminToken();
        window.location.assign("/admin");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    const res = await adminFetch("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
    return res.ok;
  }, []);

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
        <h1 className="font-display text-2xl font-bold text-plum-900">إعدادات الموقع</h1>
        <p className="text-sm text-plum-900/60">
          تحكّمي بألوان ومظهر الموقع، الصور الثابتة، الخطوط، ترتيب الأقسام، والنصوص — من غير تعديل كود
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-blush-100 pb-2">
        {subNav.map((n) => (
          <button
            key={n.key}
            onClick={() => setSubTab(n.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              subTab === n.key
                ? "bg-gradient-to-l from-blush-500 to-blush-600 text-white shadow"
                : "bg-white text-plum-900/70 hover:bg-blush-50"
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {subTab === "images" && <AdminImagesPanel settings={settings} onSave={saveSetting} />}
      {subTab === "text" && <AdminTextPanel settings={settings} onSave={saveSetting} />}
      {subTab === "fonts" && <AdminFontsPanel settings={settings} onSave={saveSetting} />}
      {subTab === "colors" && <AdminColorsPanel settings={settings} onSave={saveSetting} />}
      {subTab === "layout" && <AdminLayoutPanel settings={settings} onSave={saveSetting} />}

      {/* debug hint during development; not shown to end users of the store */}
      <p className="mt-8 text-xs text-plum-900/30">
        عدد الإعدادات المحفوظة حالياً: {Object.keys(settings).length}
      </p>
    </div>
  );
}
