"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("خطأ غير متوقع:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="brand-logo font-display text-6xl font-bold">⚠️</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-plum-900">
        حدث خطأ غير متوقع
      </h1>
      <p className="mt-2 text-plum-900/60">
        نعتذر عن الإزعاج، حاولي تحديث الصفحة أو العودة للرئيسية.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/"
          className="rounded-full border border-blush-200 px-10 py-3.5 text-sm font-bold text-plum-900 transition hover:bg-blush-50"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
