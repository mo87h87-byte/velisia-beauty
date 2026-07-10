import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "تواصلي معنا | velisiabeauty",
  description: "تواصلي مع فريق خدمة عملاء velisiabeauty — نحن هنا لمساعدتك.",
};

const channels = [
  { icon: "📞", title: "اتصلي بنا", value: "٩٢٠ ٠٠٠ ٠٠٠", note: "من ٩ صباحاً حتى ١١ مساءً" },
  { icon: "✉️", title: "البريد الإلكتروني", value: "care@velisiabeauty.com", note: "نرد خلال ٢٤ ساعة" },
  { icon: "💬", title: "واتساب", value: "٠٥٠ ٠٠٠ ٠٠٠٠", note: "دعم فوري ٢٤/٧" },
  { icon: "📍", title: "الموقع", value: "الرياض، المملكة العربية السعودية", note: "المقر الرئيسي" },
];

export default function ContactPage() {
  return (
    <InfoPage
      title="تواصلي معنا"
      icon="💌"
      subtitle="فريقنا سعيد بخدمتك والإجابة على جميع استفساراتك"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((c) => (
          <div key={c.title} className="rounded-3xl border border-blush-100 bg-white p-6 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blush-50 text-2xl">
              {c.icon}
            </span>
            <h3 className="mt-3 font-bold text-plum-900">{c.title}</h3>
            <p className="mt-1 text-sm font-semibold text-blush-600" dir="auto">{c.value}</p>
            <p className="mt-0.5 text-xs text-plum-900/50">{c.note}</p>
          </div>
        ))}
      </div>

      <ContactForm />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-3xl bg-gradient-to-l from-blush-100 to-champagne p-6 text-center">
        <span className="font-bold text-plum-900">تابعينا على وسائل التواصل:</span>
        <div className="flex gap-3">
          {["📷", "🎵", "👻", "▶️"].map((s, i) => (
            <span key={i} className="grid h-10 w-10 place-items-center rounded-full bg-white text-lg shadow-sm transition hover:scale-110">
              {s}
            </span>
          ))}
        </div>
      </div>
    </InfoPage>
  );
}
