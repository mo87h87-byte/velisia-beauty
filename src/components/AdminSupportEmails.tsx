"use client";

import { useEffect, useState } from "react";

type SupportEmail = {
  id: number;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body: string;
  reason: string;
  received_at: string;
};

export default function AdminSupportEmails() {
  const [emails, setEmails] = useState<SupportEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support-emails");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch {
      // تجاهل الخطأ، ستظهر القائمة فارغة
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markResolved = async (id: number) => {
    setResolvingId(id);
    try {
      await fetch("/api/admin/support-emails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setEmails((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-plum-900">الإيميلات المحتاجة رد</h1>
          <p className="mt-1 text-sm text-plum-900/60">
            رسائل وصلت من العملاء ولم يتم الرد عليها تلقائياً
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-full border border-blush-200 px-4 py-2 text-sm font-semibold text-plum-900/70 hover:bg-blush-50"
        >
          🔄 تحديث
        </button>
      </div>

      {emails.length === 0 ? (
        <div className="rounded-3xl border border-blush-100 bg-white p-10 text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-sm font-semibold text-plum-900">
            لا توجد إيميلات تحتاج مراجعة حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="rounded-3xl border border-blush-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-plum-900">
                      {email.from_name || email.from_email}
                    </span>
                    <span className="text-xs text-plum-900/50">{email.from_email}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-plum-900/80">
                    {email.subject || "(بدون موضوع)"}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    ⚠️ {email.reason}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-plum-900/40">
                  {new Date(email.received_at).toLocaleString("ar-EG")}
                </span>
              </div>

              <button
                onClick={() =>
                  setExpandedId(expandedId === email.id ? null : email.id)
                }
                className="mt-3 text-xs font-semibold text-blush-600 hover:underline"
              >
                {expandedId === email.id ? "إخفاء الرسالة ▲" : "عرض الرسالة كاملة ▼"}
              </button>

              {expandedId === email.id && (
                <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-blush-50 p-4 text-sm text-plum-900/80">
                  {email.body}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${email.from_email}?subject=${encodeURIComponent(
                    "Re: " + (email.subject || "")
                  )}`}
                  className="rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-4 py-2 text-xs font-bold text-white"
                >
                  ✉️ الرد بالإيميل
                </a>
                <button
                  onClick={() => markResolved(email.id)}
                  disabled={resolvingId === email.id}
                  className="rounded-full border border-blush-200 px-4 py-2 text-xs font-semibold text-plum-900/70 hover:bg-blush-50 disabled:opacity-50"
                >
                  {resolvingId === email.id ? "جاري..." : "✔️ تم الرد"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}