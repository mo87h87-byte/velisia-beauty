"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Mail
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          className="w-full rounded-full border border-white/25 bg-white/10 py-3 pr-11 pl-4 text-sm text-white placeholder:text-white/60 outline-none backdrop-blur focus:border-white/50"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-7 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(236,72,153,0.6)] transition hover:-translate-y-0.5"
      >
        {submitted ? (
          <>
            <Check size={16} /> تم الاشتراك
          </>
        ) : (
          "اشتركي الآن"
        )}
      </button>
    </form>
  );
}