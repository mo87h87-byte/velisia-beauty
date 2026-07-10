import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="brand-logo font-display text-6xl font-bold">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-plum-900">
        الصفحة غير موجودة
      </h1>
      <p className="mt-2 text-plum-900/60">
        يبدو أن هذه الصفحة قد انتقلت أو لم تعد متاحة.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
