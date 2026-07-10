import Link from "next/link";
import type { ReactNode } from "react";

export default function InfoPage({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {/* Hero band */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-blush-100 via-blush-50 to-champagne">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blush-200/50 blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          {icon && <div className="mb-3 text-5xl">{icon}</div>}
          <h1 className="font-display text-3xl font-bold text-plum-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-plum-900/70">{subtitle}</p>
          )}
          <nav className="mt-5 flex items-center justify-center gap-2 text-xs text-plum-900/50">
            <Link href="/" className="hover:text-blush-600">الرئيسية</Link>
            <span>/</span>
            <span className="text-plum-900/80">{title}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">{children}</div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:p-8">
      {title && (
        <h2 className="mb-4 font-display text-xl font-bold text-plum-900">{title}</h2>
      )}
      <div className="space-y-3 leading-loose text-plum-900/75">{children}</div>
    </section>
  );
}
