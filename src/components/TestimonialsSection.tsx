"use client";

import { useState } from "react";
import TestimonialForm from "./TestimonialForm";

type TestimonialItem = {
  id: number;
  name: string;
  rating: number;
  comment: string;
};

export default function TestimonialsSection({ items }: { items: TestimonialItem[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="pearl-ring relative inline-block rounded-2xl bg-gradient-to-br from-[#f3e5c9] via-[#e8c98f] to-[#d9ad6a] px-6 py-2.5 text-lg font-extrabold text-plum-900 shadow-[0_10px_20px_-6px_rgba(88,28,80,0.4),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(120,80,20,0.35)] ring-1 ring-[#c9a86a]/40 transition hover:-translate-y-0.5 md:text-xl"
        >
          آراء عملائنا
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <TestimonialForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="pearl-ring relative flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 text-center shadow-[0_10px_20px_-10px_rgba(88,28,80,0.4),0_3px_8px_-3px_rgba(88,28,80,0.25)] ring-1 ring-blush-200 transition duration-300 hover:-translate-y-1 hover:ring-blush-400"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blush-300 to-blush-500 text-sm font-bold text-white shadow-sm ring-2 ring-blush-200">
                {t.name.trim().charAt(0)}
              </span>
              <div className="flex items-center gap-0.5 text-xs text-amber-500">
                {"★".repeat(t.rating)}
              </div>
              <p className="text-xs text-plum-900/70">{t.comment}</p>
              <span className="text-sm font-extrabold text-plum-900">{t.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}