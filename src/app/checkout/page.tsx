"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAccount } from "@/lib/account-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

const cities = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الطائف", "تبوك", "أبها", "بريدة", "حائل", "نجران",
];

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clear } = useCart();
  const { customer } = useAccount();
  const [step, setStep] = useState<1 | 2>(1);
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("");
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    city: cities[0],
    address: "",
    notes: "",
  });

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
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

  const setCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCard((c) => ({ ...c, number: formatted }));
  };

  const setExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCard((c) => ({ ...c, expiry: formatted }));
  };

  const validateCard = (): string | null => {
    const num = card.number.replace(/\s/g, "");
    if (num.length < 16) return "رقم البطاقة غير صحيح";
    if (!card.name.trim()) return "يرجى إدخال الاسم على البطاقة";
    const [mm, yy] = card.expiry.split("/");
    const month = Number(mm);
    if (!mm || !yy || month < 1 || month > 12)
      return "تاريخ انتهاء البطاقة غير صحيح";
    const now = new Date();
    const expDate = new Date(2000 + Number(yy), month - 1, 1);
    if (expDate < new Date(now.getFullYear(), now.getMonth(), 1))
      return "البطاقة منتهية الصلاحية";
    if (card.cvv.replace(/\D/g, "").length < 3) return "رمز CVV غير صحيح";
    return null;
  };

  const goPay = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.customerName || !form.email || !form.phone || !form.address) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    setError("");

    // Validate the selected payment method before processing.
    if (payment === "card") {
      const cardError = validateCard();
      if (cardError) {
        setError(cardError);
        return;
      }
    }

    setLoading(true);
    try {
      // Simulate secure payment authorization for online methods.
      if (payment !== "cod") {
        setProcessingMsg(
          payment === "applepay"
            ? "جاري التأكيد عبر Apple Pay..."
            : payment === "stcpay"
              ? "جاري التأكيد عبر STC Pay..."
              : "جاري معالجة الدفع بشكل آمن...",
        );
        await new Promise((r) => setTimeout(r, 1600));
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: payment,
          paymentStatus: payment === "cod" ? "pending" : "paid",
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
      setProcessingMsg("");
    }
  };

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
                  <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls}>
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="العنوان التفصيلي *">
                <textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} className={inputCls} placeholder="الحي، الشارع، رقم المبنى..." />
              </Field>
              <Field label="ملاحظات (اختياري)">
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputCls} placeholder="أي تعليمات خاصة بالتوصيل" />
              </Field>
              {error && <p className="text-sm text-red-500">{error}</p>}
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
                    { key: "applepay", icon: "", label: "Apple Pay", desc: "دفع سريع وآمن" },
                    { key: "stcpay", icon: "📱", label: "STC Pay", desc: "المحفظة الرقمية" },
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
                  <div className="mt-4 grid gap-3 rounded-2xl bg-blush-50 p-4 sm:grid-cols-2">
                    <input
                      value={card.number}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className={`${inputCls} sm:col-span-2`}
                      placeholder="رقم البطاقة"
                      dir="ltr"
                      inputMode="numeric"
                    />
                    <input
                      value={card.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                      className={`${inputCls} sm:col-span-2`}
                      placeholder="الاسم على البطاقة"
                    />
                    <input
                      value={card.expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className={inputCls}
                      placeholder="MM / YY"
                      dir="ltr"
                      inputMode="numeric"
                    />
                    <input
                      value={card.cvv}
                      onChange={(e) =>
                        setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                      }
                      className={inputCls}
                      placeholder="CVV"
                      dir="ltr"
                      inputMode="numeric"
                    />
                    <p className="col-span-full flex items-center gap-1.5 text-xs text-plum-900/50">
                      🔒 دفع آمن ومشفّر — بيئة تجريبية، لن يتم أي خصم فعلي.
                    </p>
                  </div>
                )}
                {payment === "applepay" && (
                  <div className="mt-4 rounded-2xl bg-black p-5 text-center text-white">
                    <p className="text-lg font-bold"> Pay</p>
                    <p className="mt-1 text-xs text-white/70">
                      سيتم تأكيد الدفع بلمسة واحدة عند تأكيد الطلب
                    </p>
                  </div>
                )}
                {payment === "stcpay" && (
                  <div className="mt-4 rounded-2xl bg-gradient-to-l from-purple-600 to-fuchsia-600 p-5 text-center text-white">
                    <p className="text-lg font-bold">STC Pay 📱</p>
                    <p className="mt-1 text-xs text-white/80">
                      سيصلك إشعار على تطبيق STC Pay لتأكيد الدفع
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

              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={placeOrder}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-4 text-base font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {loading
                  ? processingMsg || "جاري تأكيد الطلب..."
                  : payment === "cod"
                    ? `تأكيد الطلب — ${formatPrice(total)}`
                    : `ادفعي الآن — ${formatPrice(total)}`}
              </button>
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
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-blush-500">
                  أضيفي بـ {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} لشحن مجاني
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-plum-900">{label}</span>
      {children}
    </label>
  );
}
