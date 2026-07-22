import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import ContactForm from "@/components/ContactForm";
import { db } from "@/db";
import { settings } from "@/db/schema";


export const metadata: Metadata = {
  title: "تواصلي معنا | velisiabeauty",
  description: "تواصلي مع فريق خدمة عملاء velisiabeauty — نحن هنا لمساعدتك.",
};

type Channel = { icon: string; title: string; value: string; note?: string };

const defaultChannels: Channel[] = [
  { icon: "📞", title: "اتصلي بنا", value: "٩٢٠ ٠٠٠ ٠٠٠", note: "من ٩ صباحاً حتى ١١ مساءً" },
  { icon: "✉️", title: "البريد الإلكتروني", value: "care@velisiabeauty.com", note: "نرد خلال ٢٤ ساعة" },
  { icon: "💬", title: "واتساب", value: "٠٥٠ ٠٠٠ ٠٠٠٠", note: "دعم فوري ٢٤/٧" },
  { icon: "📍", title: "الموقع", value: "الرياض، المملكة العربية السعودية", note: "المقر الرئيسي" },
];

// يحول أي رقم هاتف سعودي (بأي صيغة) إلى صيغة دولية بدون رموز، لاستخدامه في روابط واتساب/اتصال
function toIntlPhone(value: string): string {
  const digitsOnly = value.replace(/[^\d٠-٩]/g, "");
  const westernDigits = digitsOnly.replace(/[٠-٩]/g, (d) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(d))
  );
  if (westernDigits.startsWith("966")) return westernDigits;
  if (westernDigits.startsWith("0")) return "966" + westernDigits.slice(1);
  return "966" + westernDigits;
}

// يبني رابط مناسب لكل نوع قناة تواصل بناءً على العنوان أو الأيقونة
function getChannelLink(channel: Channel): string | null {
  const { icon, title, value } = channel;

  if (icon.includes("💬") || title.includes("واتساب")) {
    return `https://wa.me/${toIntlPhone(value)}`;
  }
  if (icon.includes("✉️") || title.includes("البريد")) {
    return `mailto:${value}`;
  }
  if (icon.includes("📞") || title.includes("اتصل")) {
    return `tel:+${toIntlPhone(value)}`;
  }
  if (icon.includes("📍") || title.includes("الموقع")) {
    return `https://www.google.com/maps/search/${encodeURIComponent(value)}`;
  }
  return null;
}

export default async function ContactPage() {
  const allSettings = await db.select().from(settings);
  const channelsRow = allSettings.find((s) => s.key === "contact_channels");
  const channels: Channel[] = (channelsRow?.value as Channel[]) || defaultChannels;


  return (
    <InfoPage
      title="تواصلي معنا"
      icon="💌"
      subtitle="فريقنا سعيد بخدمتك والإجابة على جميع استفساراتك"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((c) => {
          const href = getChannelLink(c);
          const CardContent = (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blush-50 text-2xl">
                {c.icon}
              </span>
              <h3 className="mt-3 font-bold text-plum-900">{c.title}</h3>
              <p className="mt-1 text-sm font-semibold text-blush-600" dir="auto">{c.value}</p>
              <p className="mt-0.5 text-xs text-plum-900/50">{c.note}</p>
            </>
          );

          if (href) {
            return (
              <a
                key={c.title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block rounded-3xl border border-blush-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                {CardContent}
              </a>
            );
          }

          return (
            <div key={c.title} className="rounded-3xl border border-blush-100 bg-white p-6 text-center shadow-sm">
              {CardContent}
            </div>
          );
        })}
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