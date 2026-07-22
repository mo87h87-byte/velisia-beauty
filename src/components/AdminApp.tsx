"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  saveAdminToken,
  getAdminToken,
  clearAdminToken,
} from "@/lib/admin-client";
import AdminDashboardClient from "@/components/AdminDashboardClient";
import AdminProducts from "@/components/AdminProducts";
import AdminOrders from "@/components/AdminOrders";
import AdminMessages from "@/components/AdminMessages";
import AdminTestimonials from "@/components/AdminTestimonials";


type Tab = "dashboard" | "products" | "orders" | "messages" | "testimonials";

const nav: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "لوحة التحكم", icon: "📊" },
  { key: "products", label: "المنتجات", icon: "🧴" },
  { key: "orders", label: "الطلبات", icon: "📦" },
  { key: "messages", label: "الرسائل", icon: "💌" },
  { key: "testimonials", label: "آراء العملاء", icon: "💬" },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAuthed(!!getAdminToken());
  }, []);

  const onLogin = useCallback(() => setAuthed(true), []);
  const logout = useCallback(() => {
    clearAdminToken();
    fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    setAuthed(false);
    setTab("dashboard");
  }, []);

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-blush-50">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  if (!authed) return <LoginView onLogin={onLogin} />;

  return (
    <div className="min-h-screen bg-blush-50">
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-blush-100 bg-white px-4 py-3 lg:hidden">
        <span className="brand-logo text-xl font-bold">velisiabeauty</span>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="القائمة"
          className="grid h-9 w-9 place-items-center rounded-full text-plum-900"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-64 transform border-l border-blush-100 bg-white transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="hidden border-b border-blush-100 px-6 py-5 lg:block">
            <span className="brand-logo text-2xl font-bold">velisiabeauty</span>
            <p className="mt-0.5 text-[10px] tracking-[0.3em] text-rose-gold">ADMIN PANEL</p>
          </div>
          <nav className="space-y-1 p-4">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => {
                  setTab(n.key);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  tab === n.key
                    ? "bg-gradient-to-l from-blush-500 to-blush-600 text-white shadow"
                    : "text-plum-900/70 hover:bg-blush-50"
                }`}
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-blush-100 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-plum-900/70 transition hover:bg-blush-50"
            >
              🏪 عرض المتجر
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-plum-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          {tab === "dashboard" && <AdminDashboardClient onNavigate={setTab} />}
          {tab === "products" && <AdminProducts />}
          {tab === "orders" && <AdminOrders />}
          {tab === "messages" && <AdminMessages />}
          {tab === "testimonials" && <AdminTestimonials />}
        </main>
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      if (data.token) saveAdminToken(data.token);
      // No page navigation — stay in the SPA so the in-memory token persists
      // even if the browser blocks storage inside the preview iframe.
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-bl from-blush-100 via-blush-50 to-champagne px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="brand-logo text-3xl font-bold">velisiabeauty</span>
          <p className="mt-1 text-xs tracking-[0.3em] text-rose-gold">لوحة التحكم</p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-blush-100 bg-white/90 p-7 shadow-xl backdrop-blur"
        >
          <div className="text-center">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-2 text-lg font-bold text-plum-900">تسجيل دخول المشرف</h1>
            <p className="mt-1 text-xs text-plum-900/60">أدخلي كلمة المرور للوصول للوحة التحكم</p>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full rounded-xl border border-blush-200 bg-white px-4 py-3 pl-11 text-sm outline-none focus:border-blush-400"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lg"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            دخول
          </button>
      
          <Link href="/" className="block text-center text-xs text-plum-900/50 hover:text-blush-600">
            ← العودة للمتجر
          </Link>
        </form>
      </div>
    </div>
  );
}