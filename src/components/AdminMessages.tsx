"use client";

import { useEffect, useState } from "react";
import type { Message } from "@/db/schema";
import { formatArabicDate } from "@/lib/format";
import { adminFetch, clearAdminToken } from "@/lib/admin-client";

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/data");
        if (res.status === 401) {
          clearAdminToken();
          window.location.assign("/admin");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return (
      <div className="grid place-items-center py-20">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blush-200 border-t-blush-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-plum-900">الرسائل</h1>
        <p className="text-sm text-plum-900/60">{messages.length} رسالة من العملاء</p>
      </div>

      {messages.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-blush-200 bg-white py-16 text-center">
          <span className="text-4xl">💌</span>
          <p className="mt-3 font-bold text-plum-900">لا توجد رسائل بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-blush-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blush-100 font-bold text-blush-600">
                    {m.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-plum-900">{m.name}</p>
                    <p className="text-xs text-plum-900/50" dir="ltr">{m.email}</p>
                  </div>
                </div>
                <span className="text-xs text-plum-900/50">{formatArabicDate(m.createdAt)}</span>
              </div>
              <p className="mt-3 font-semibold text-blush-600">{m.subject}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum-900/70">{m.message}</p>
              <a
                href={`mailto:${m.email}?subject=رد: ${encodeURIComponent(m.subject)}`}
                className="mt-3 inline-block rounded-lg bg-blush-50 px-4 py-1.5 text-xs font-semibold text-blush-600 transition hover:bg-blush-100"
              >
                ✉️ الرد عبر البريد
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
