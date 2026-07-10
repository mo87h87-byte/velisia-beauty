"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 bg-gradient-to-b from-plum-800 to-plum-900 text-blush-100">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 text-center md:flex-row md:justify-between md:text-right">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              اشتركي في نشرتنا البريدية
            </h3>
            <p className="mt-1 text-sm text-blush-200">
              لتصلك أحدث العروض والمنتجات الجديدة أولاً بأول
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setDone(true);
            }}
            className="flex w-full max-w-md items-center gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-blush-200/70 outline-none focus:border-blush-300"
            />
            <button className="whitespace-nowrap rounded-full bg-gradient-to-l from-blush-400 to-blush-500 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90">
              {done ? "تم ✓" : "اشتراك"}
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="brand-logo text-2xl font-bold">velisiabeauty</span>
          <p className="mt-4 text-sm leading-relaxed text-blush-200">
            وجهتكِ الأولى لمنتجات التجميل والعناية بالبشرة والشعر والعطور من أفخم
            الماركات العالمية الأصلية.
          </p>
          <div className="mt-5 flex gap-3">
            {["instagram", "tiktok", "snapchat", "youtube"].map((s) => (
              <span
                key={s}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg transition hover:bg-blush-500"
              >
                {s === "instagram" ? "📷" : s === "tiktok" ? "🎵" : s === "snapchat" ? "👻" : "▶️"}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-white">التسوق</h4>
          <ul className="space-y-2.5 text-sm text-blush-200">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.key}>
                <Link href={`/products?category=${c.key}`} className="transition hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-white">خدمة العملاء</h4>
          <ul className="space-y-2.5 text-sm text-blush-200">
            <li><Link href="/pages/track-order" className="transition hover:text-white">تتبع الطلب</Link></li>
            <li><Link href="/pages/payment" className="transition hover:text-white">طرق الدفع</Link></li>
            <li><Link href="/pages/returns" className="transition hover:text-white">سياسة الإرجاع والاستبدال</Link></li>
            <li><Link href="/pages/contact" className="transition hover:text-white">تواصلي معنا</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-white">معلومات</h4>
          <ul className="space-y-2.5 text-sm text-blush-200">
            <li><Link href="/pages/about" className="transition hover:text-white">من نحن</Link></li>
            <li><Link href="/pages/faq" className="transition hover:text-white">الأسئلة الشائعة</Link></li>
            <li><Link href="/pages/privacy" className="transition hover:text-white">سياسة الخصوصية</Link></li>
            <li><Link href="/pages/terms" className="transition hover:text-white">الشروط والأحكام</Link></li>
            <li><Link href="/admin" className="transition hover:text-white">🔐 لوحة التحكم</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-blush-200 sm:flex-row">
          <p>© {new Date().getFullYear()} velisiabeauty — جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1">جمالكِ يستحق الأفضل 💗</p>
        </div>
      </div>
    </footer>
  );
}
