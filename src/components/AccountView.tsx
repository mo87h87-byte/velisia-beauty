"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, accountFetch, type Customer } from "@/lib/account-context";
import type { Order } from "@/db/schema";
import { formatPrice, formatArabicDate } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-status";

export default function AccountView() {
  const { customer, ready, setSession, updateCustomer, logout } = useAccount();

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  if (!customer) return <AuthForms onAuthed={setSession} />;

  return (
    <Dashboard
      customer={customer}
      onUpdate={updateCustomer}
      onLogout={logout}
    />
  );
}

/* ---------------- Auth (login / register) ---------------- */

function AuthForms({
  onAuthed,
}: {
  onAuthed: (token: string, c: Customer) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const up = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/account/login" : "/api/account/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      onAuthed(data.token, data.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="mb-6 text-center">
        <span className="text-4xl">👋</span>
        <h1 className="mt-2 font-display text-2xl font-bold text-plum-900">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>
        <p className="mt-1 text-sm text-plum-900/60">
          {mode === "login"
            ? "أهلاً بعودتك! سجّلي دخولك لمتابعة طلباتك"
            : "انضمي إلينا واستمتعي بتجربة تسوّق مميزة"}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-blush-100 p-1">
        <button
          onClick={() => { setMode("login"); setError(""); }}
          className={`rounded-full py-2 text-sm font-bold transition ${mode === "login" ? "bg-white text-blush-600 shadow" : "text-plum-900/60"}`}
        >
          دخول
        </button>
        <button
          onClick={() => { setMode("register"); setError(""); }}
          className={`rounded-full py-2 text-sm font-bold transition ${mode === "register" ? "bg-white text-blush-600 shadow" : "text-plum-900/60"}`}
        >
          حساب جديد
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
        {mode === "register" && (
          <>
            <input value={form.name} onChange={(e) => up("name", e.target.value)} placeholder="الاسم الكامل" className={inp} />
            <input value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="رقم الجوال" className={inp} dir="ltr" />
          </>
        )}
        <input type="email" value={form.email} onChange={(e) => up("email", e.target.value)} placeholder="البريد الإلكتروني" className={inp} dir="ltr" />
        <input type="password" value={form.password} onChange={(e) => up("password", e.target.value)} placeholder="كلمة المرور" className={inp} dir="ltr" />
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
        <Link href="/" className="block text-center text-xs text-plum-900/50 hover:text-blush-600">
          ← العودة للتسوّق
        </Link>
      </form>
    </div>
  );
}

/* ---------------- Logged-in dashboard ---------------- */

function Dashboard({
  customer,
  onUpdate,
  onLogout,
}: {
  customer: Customer;
  onUpdate: (c: Customer) => void;
  onLogout: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    (async () => {
      try {
        const res = await accountFetch("/api/account/me");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-plum-800 to-blush-800 p-6 text-white">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 text-2xl font-bold">
            {customer.name.charAt(0)}
          </span>
          <div>
            <p className="font-display text-xl font-bold">مرحباً، {customer.name}</p>
            <p className="text-sm text-blush-200" dir="ltr">{customer.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full bg-white/15 px-5 py-2 text-sm font-bold transition hover:bg-white/25"
        >
          🚪 تسجيل الخروج
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-blush-100">
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-3 text-sm font-bold transition ${tab === "orders" ? "border-b-2 border-blush-500 text-blush-600" : "text-plum-900/60"}`}
        >
          طلباتي ({orders.length})
        </button>
        <button
          onClick={() => setTab("profile")}
          className={`px-5 py-3 text-sm font-bold transition ${tab === "profile" ? "border-b-2 border-blush-500 text-blush-600" : "text-plum-900/60"}`}
        >
          بياناتي
        </button>
      </div>

      {tab === "orders" ? (
        !loaded ? (
          <div className="grid place-items-center py-16">
            <span className="h-9 w-9 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-blush-200 bg-white py-16 text-center">
            <span className="text-5xl">🛍️</span>
            <p className="mt-4 text-lg font-bold text-plum-900">لا توجد طلبات بعد</p>
            <p className="mt-1 text-sm text-plum-900/60">ابدئي التسوّق واكتشفي تشكيلتنا الفاخرة</p>
            <Link href="/products" className="mt-5 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90">
              تصفّحي المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )
      ) : (
        <ProfileForm customer={customer} onUpdate={onUpdate} />
      )}
    </div>
  );
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const items = (order.items as OrderItem[]) ?? [];
  return (
    <div className="overflow-hidden rounded-2xl border border-blush-100 bg-white shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-right">
        <div>
          <p className="font-bold text-blush-600">{order.orderNumber}</p>
          <p className="text-xs text-plum-900/60">{formatArabicDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className="font-extrabold text-plum-900">{formatPrice(order.total)}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-plum-900/40 transition ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-blush-50 bg-blush-50/40 p-4">
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm text-plum-900">{it.name}</p>
                  <p className="text-xs text-plum-900/50">{it.quantity} × {formatPrice(it.price)}</p>
                </div>
                <span className="text-sm font-semibold text-blush-600">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 border-t border-blush-100 pt-3 text-xs text-plum-900/60">
            <span>طريقة الدفع: {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
            <span>التوصيل إلى: {order.city}، {order.address}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileForm({
  customer,
  onUpdate,
}: {
  customer: Customer;
  onUpdate: (c: Customer) => void;
}) {
  const [form, setForm] = useState({ name: customer.name, phone: customer.phone, city: customer.city });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setDone(false);
    try {
      const res = await accountFetch("/api/account/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.customer);
        setDone(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg space-y-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-semibold text-plum-900">الاسم</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-plum-900">البريد الإلكتروني</label>
        <input value={customer.email} disabled className={`${inp} bg-blush-50 text-plum-900/50`} dir="ltr" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-plum-900">رقم الجوال</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} dir="ltr" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-plum-900">المدينة</label>
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
      </div>
      {done && <p className="text-sm font-semibold text-green-600">✓ تم حفظ بياناتك</p>}
      <button
        disabled={saving}
        className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-blush-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blush-400";
