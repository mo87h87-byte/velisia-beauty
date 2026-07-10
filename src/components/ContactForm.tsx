"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("حدث خطأ، حاولي مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="grid place-items-center rounded-3xl border border-blush-100 bg-white p-10 text-center shadow-sm">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl">✅</span>
        <h3 className="mt-4 font-display text-xl font-bold text-plum-900">تم إرسال رسالتك!</h3>
        <p className="mt-2 text-sm text-plum-900/60">
          شكراً لتواصلك معنا 💗 سيرد عليكِ فريقنا في أقرب وقت ممكن.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-bold text-plum-900">أرسلي لنا رسالة</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="الاسم" className={inp} />
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="البريد الإلكتروني" className={inp} dir="ltr" />
      </div>
      <input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="الموضوع" className={inp} />
      <textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="رسالتك..." rows={5} className={inp} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
      </button>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-blush-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blush-400";
