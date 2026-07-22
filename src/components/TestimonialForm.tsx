"use client";

import { useState } from "react";

export default function TestimonialForm({ onClose }: { onClose?: () => void }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !comment.trim()) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, comment, rating }),
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
      <div className="grid place-items-center rounded-3xl border border-blush-100 bg-white p-8 text-center shadow-sm">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl">✅</span>
        <h3 className="mt-3 font-display text-lg font-bold text-plum-900">شكراً لرأيك!</h3>
        <p className="mt-1 text-sm text-plum-900/60">
          سيظهر تقييمك بعد مراجعته من فريقنا 💗
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-lg space-y-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h3 className="font-display text-lg font-bold text-plum-900">شاركينا رأيك</h3>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-plum-900">تقييمك</label>
        <div className="flex gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl ${n <= rating ? "text-amber-400" : "text-blush-200"}`}
              aria-label={`${n} نجوم`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="اسمك"
        className={inp}
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="شاركينا تجربتك مع منتجاتنا..."
        rows={4}
        className={inp}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {loading ? "جاري الإرسال..." : "إرسال رأيك"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-blush-200 px-6 py-3 text-sm font-bold text-plum-900 transition hover:bg-blush-50"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-blush-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blush-400";