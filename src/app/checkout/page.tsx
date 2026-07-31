"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAccount } from "@/lib/account-context";
import { formatPrice } from "@/lib/format";

const cities = [
  // منطقة الرياض
  "الرياض", "الخرج", "الدوادمي", "المجمعة", "الزلفي", "وادي الدواسر",
  "الأفلاج", "حوطة بني تميم", "عفيف", "القويعية", "ضرما", "المزاحمية",
  "شقراء", "رماح", "حريملاء", "الغاط",
  // منطقة مكة المكرمة
  "جدة", "مكة المكرمة", "الطائف", "رابغ", "القنفذة", "الليث",
  "خليص", "الجموم", "الكامل", "تربة",
  // منطقة المدينة المنورة
  "المدينة المنورة", "ينبع", "العلا", "بدر", "خيبر", "الحناكية", "مهد الذهب",
  // المنطقة الشرقية
  "الدمام", "الخبر", "الظهران", "الأحساء", "القطيف", "الجبيل",
  "الخفجي", "حفر الباطن", "النعيرية", "رأس تنورة", "بقيق",
  // منطقة القصيم
  "بريدة", "عنيزة", "الرس", "البكيرية", "المذنب", "رياض الخبراء", "الأسياح", "البدائع",
  // منطقة عسير
  "أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير", "رجال ألمع",
  "ظهران الجنوب", "تنومة", "سراة عبيدة", "بلقرن",
  // منطقة تبوك
  "تبوك", "الوجه", "ضباء", "تيماء", "أملج", "حقل",
  // منطقة حائل
  "حائل", "بقعاء", "الغزالة", "الشنان",
  // منطقة الحدود الشمالية
  "عرعر", "رفحاء", "طريف",
  // منطقة جازان
  "جازان", "صبيا", "أبو عريش", "صامطة", "الدرب", "بيش", "فرسان", "العارضة",
  // منطقة نجران
  "نجران", "شرورة", "حبونا",
  // منطقة الباحة
  "الباحة", "بلجرشي", "المخواة", "المندق", "قلوة",
  // منطقة الجوف
  "سكاكا", "القريات", "دومة الجندل", "طبرجل",
];

// Holds the orderNumber of the "awaiting_payment" order created right
// before handing off to Moyasar, so the return-trip effect can find it
// again after the redirect (same browser, same localStorage).
const PENDING_ORDER_KEY = "velisia_pending_order";

const isValidSaudiPhone = (phone: string) => {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(05\d{8}|\+9665\d{8}|9665\d{8})$/.test(cleaned);
};

declare global {
  interface Window {
    Moyasar?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

function CheckoutPageInner() {
  const { items, subtotal, shipping, total, clear, freeShippingThreshold } = useCart();
  const { customer } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [verifyingCallback, setVerifyingCallback] = useState(false);
  const mysrInitialized = useRef(false);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    city: cities[0],
    address: "",
    notes: "",
  });

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Prefill shipping details for logged-in customers.
  useEffect(() => {
    if (customer) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || customer.name,
        email: f.email || customer.email,
        phone: f.phone || customer.phone,
        city: customer.city && cities.includes(customer.city) ? customer.city : f.city,
      }));
    }
  }, [customer]);

  // Handle the return trip from Moyasar after a card payment attempt. The
  // order itself already exists (created as "awaiting_payment" before the
  // redirect, below) — this only confirms payment against it, it never
  // creates a new order.
  useEffect(() => {
    const paymentId = searchParams.get("id");
    const status = searchParams.get("status");
    if (!paymentId || !status) return;

    const finalize = async () => {
      setVerifyingCallback(true);
      setError("");
      try {
        const pendingOrderNumber = localStorage.getItem(PENDING_ORDER_KEY);
        if (!pendingOrderNumber) {
          setError("تعذر العثور على بيانات الطلب، يرجى المحاولة مرة أخرى");
          return;
        }

        const res = await fetch("/api/orders/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber: pendingOrderNumber, paymentId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "لم تكتمل عملية الدفع، يرجى المحاولة مرة أخرى");
          setStep(2);
          setPayment("card");
          return;
        }

        localStorage.removeItem(PENDING_ORDER_KEY);
        setOrderNumber(data.order.orderNumber);
        clear();
        router.replace("/checkout");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ أثناء تأكيد الدفع");
      } finally {
        setVerifyingCallback(false);
      }
    };

    finalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount the Moyasar hosted card form once the shopper selects "card". The
  // order is created first (status "awaiting_payment") so a record exists
  // even if the shopper never completes or returns from the Moyasar form —
  // only /api/orders/confirm-payment (after a verified return trip) ever
  // moves it past that state.
  useEffect(() => {
    if (payment !== "card" || step !== 2) {
      mysrInitialized.current = false;
      return;
    }
    if (mysrInitialized.current) return;
    if (typeof window === "undefined" || !window.Moyasar) return;
    if (!form.customerName || !form.email || !form.phone || !form.address) return;

    mysrInitialized.current = true;

    const createPendingOrderAndInit = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, paymentMethod: "card", items }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر إنشاء الطلب");

        localStorage.setItem(PENDING_ORDER_KEY, data.order.orderNumber);

        window.Moyasar!.init({
          element: ".mysr-form",
          amount: Math.round(total * 100),
          currency: "SAR",
          description: `طلب من velisiabeauty — ${form.customerName}`,
          publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
          callback_url:
            typeof window !== "undefined" ? `${window.location.origin}/checkout` : "",
          methods: ["creditcard"],
          language: "ar",
          // Echoed back on the payment object Moyasar sends to our webhook,
          // so it can find this same order without depending on the
          // shopper's browser ever coming back.
          metadata: { order_number: data.order.orderNumber },
          // Fires right after Moyasar creates the payment, before any 3-D
          // Secure redirect — save the payment id now (best-effort) so the
          // reconciliation cron has something to check even if the
          // shopper's connection drops before they ever come back.
          on_completed: async (payment: { id?: string }) => {
            if (!payment?.id) return;
            try {
              await fetch("/api/orders/save-payment-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber: data.order.orderNumber, paymentId: payment.id }),
              });
            } catch {
              // Best-effort only — the return-trip confirm and the webhook
              // don't depend on this having succeeded.
            }
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر بدء عملية الدفع، حاولي مرة أخرى");
        mysrInitialized.current = false;
      }
    };

    createPendingOrderAndInit();
  }, [payment, step, total, form, items]);

  const goPay = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.customerName || !form.email || !form.phone || !form.address) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (!isValidSaudiPhone(form.phone)) {
      setError("يرجى إدخال رقم جوال سعودي صحيح (مثال: 05xxxxxxxx)");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    setError("");
    setLoading(true);
    try {
      // This flow only ever runs for "cod" — card payments are handled
      // separately by the Moyasar hosted form above.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: payment,
          paymentStatus: "pending",
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setOrderNumber(data.order.orderNumber);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاولي مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  // Verifying a return from Moyasar
  if (verifyingCallback) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-300 border-t-blush-600" />
        <p className="mt-6 text-plum-900/70">جاري التحقق من عملية الدفع...</p>
      </div>
    );
  }

  // Success screen
  if (orderNumber) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-green-100 text-5xl animate-fade-up">
          ✅
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-plum-900">
          تم استلام طلبك بنجاح!
        </h1>
        <p className="mt-3 text-plum-900/70">
          شكراً لثقتك بـ velisiabeauty 💗 سنتواصل معك قريباً لتأكيد الطلب.
        </p>
        <div className="mt-6 rounded-2xl border border-blush-100 bg-white px-8 py-4">
          <p className="text-sm text-plum-900/60">رقم الطلب</p>
          <p className="font-display text-2xl font-bold text-blush-600">{orderNumber}</p>
        </div>
        <Link
          href="/products"
          className="mt-8 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
        >
          متابعة التسوق
        </Link>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-blush-100 text-5xl">🛍️</div>
        <h1 className="mt-6 font-display text-2xl font-bold text-plum-900">سلتك فارغة</h1>
        <p className="mt-2 text-plum-900/60">أضيفي بعض المنتجات قبل إتمام الطلب</p>
        <Link
          href="/products"
          className="mt-6 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
        >
          تصفّحي المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 font-display text-3xl font-bold text-plum-900">إتمام الطلب</h1>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-3 text-sm">
        <span className={`flex items-center gap-2 font-bold ${step >= 1 ? "text-blush-600" : "text-plum-900/40"}`}>
          <span className={`grid h-7 w-7 place-items-center rounded-full ${step >= 1 ? "bg-blush-500 text-white" : "bg-blush-100"}`}>1</span>
          الشحن
        </span>
        <span className="h-px w-8 bg-blush-200" />
        <span className={`flex items-center gap-2 font-bold ${step >= 2 ? "text-blush-600" : "text-plum-900/40"}`}>
          <span className={`grid h-7 w-7 place-items-center rounded-full ${step >= 2 ? "bg-blush-500 text-white" : "bg-blush-100"}`}>2</span>
          الدفع والتأكيد
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div>
          {step === 1 ? (
            <form onSubmit={goPay} className="space-y-4 rounded-3xl border border-blush-100 bg-white p-6">
              <h2 className="text-lg font-bold text-plum-900">معلومات الشحن</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="الاسم الكامل *">
                  <input value={form.customerName} onChange={(e) => update("customerName", e.target.value)} className={inputCls} placeholder="مثال: نورة أحمد" />
                </Field>
                <Field label="رقم الجوال *">
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} placeholder="05xxxxxxxx" dir="ltr" />
                </Field>
                <Field label="البريد الإلكتروني *">
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="you@email.com" dir="ltr" />
                </Field>
                <Field label="المدينة *">
                  <CityCombobox value={form.city} onChange={(v) => update("city", v)} />
                </Field>
              </div>
              <Field label="العنوان التفصيلي *">
                <textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} className={inputCls} placeholder="الحي، الشارع، رقم المبنى..." />
              </Field>
              <Field label="ملاحظات (اختياري)">
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputCls} placeholder="أي تعليمات خاصة بالتوصيل" />
              </Field>
              {error && <p className="text-sm text-error">{error}</p>}
              <button className="w-full rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90">
                متابعة للدفع ←
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border border-blush-100 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-plum-900">طريقة الدفع</h2>
                <div className="space-y-3">
                  {[
                    { key: "cod", icon: "💵", label: "الدفع عند الاستلام", desc: "ادفعي نقداً عند وصول الطلب" },
                    { key: "card", icon: "💳", label: "بطاقة مدى / ائتمانية", desc: "فيزا، ماستركارد، مدى" },
                  ].map((m) => (
                    <label
                      key={m.key}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${
                        payment === m.key ? "border-blush-500 bg-blush-50" : "border-blush-100 hover:border-blush-200"
                      }`}
                    >
                      <input type="radio" name="pay" checked={payment === m.key} onChange={() => setPayment(m.key)} className="h-4 w-4 accent-blush-500" />
                      <span className="text-2xl">{m.icon}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-plum-900">{m.label}</span>
                        <span className="block text-xs text-plum-900/60">{m.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {payment === "card" && (
                  <div className="mt-4 rounded-2xl bg-blush-50 p-4">
                    <div className="mysr-form" />
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-plum-900/50">
                      🔒 بيانات بطاقتك تُرسل مباشرة إلى Moyasar بشكل آمن ومشفّر.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-blush-100 bg-white p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-plum-900">عنوان التوصيل</h2>
                  <button onClick={() => setStep(1)} className="text-sm font-bold text-blush-600 hover:underline">
                    تعديل
                  </button>
                </div>
                <p className="text-sm text-plum-900/70">
                  {form.customerName} — {form.phone}
                  <br />
                  {form.city}، {form.address}
                </p>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              {payment !== "card" && (
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-wine-500 to-wine-600 py-4 text-base font-bold text-white shadow-lg shadow-wine-300/50 transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loading ? "جاري تأكيد الطلب..." : `تأكيد الطلب — ${formatPrice(total)}`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-3xl border border-blush-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-plum-900">ملخص الطلب</h2>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-blush-500 text-[10px] font-bold text-white">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-2 text-xs font-semibold text-plum-900">{i.name}</p>
                    <p className="mt-1 text-sm font-bold text-blush-600">{formatPrice(i.price * i.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-blush-100 pt-4 text-sm">
              <div className="flex justify-between text-plum-900/70">
                <span>المجموع الفرعي</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-plum-900/70">
                <span>الشحن</span>
                <span className="font-semibold">{shipping === 0 ? "مجاني" : formatPrice(shipping)}</span>
              </div>
              {subtotal < freeShippingThreshold && (
                <p className="text-xs text-blush-500">
                  أضيفي بـ {formatPrice(freeShippingThreshold - subtotal)} لشحن مجاني
                </p>
              )}
              <div className="flex justify-between border-t border-dashed border-blush-200 pt-3 text-base font-extrabold text-plum-900">
                <span>الإجمالي</span>
                <span className="text-blush-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-blush-200 bg-white px-4 py-2.5 text-sm text-plum-900 outline-none transition focus:border-blush-400";

function CityCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? cities.filter((c) => c.includes(query.trim()))
    : cities;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputCls} flex items-center justify-between text-right`}
      >
        <span>{value}</span>
        <span className="text-plum-900/40">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-blush-200 bg-white shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن مدينتك..."
            className="w-full border-b border-blush-100 px-4 py-2.5 text-sm outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-plum-900/50">لا توجد نتائج</p>
            )}
            {filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full px-4 py-2 text-right text-sm hover:bg-blush-50 ${
                  c === value ? "bg-blush-50 font-bold text-blush-600" : "text-plum-900"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-plum-900">{label}</span>
      {children}
    </label>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageInner />
    </Suspense>
  );
}