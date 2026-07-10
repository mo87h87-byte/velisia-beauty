import type { Metadata } from "next";
import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "طرق الدفع | velisiabeauty",
  description: "تعرّفي على طرق الدفع المتاحة في متجر velisiabeauty.",
};

const methods = [
  { icon: "💵", title: "الدفع عند الاستلام", text: "ادفعي نقداً عند وصول طلبك إلى باب منزلك. متاح في جميع مدن المملكة." },
  { icon: "💳", title: "البطاقات الائتمانية ومدى", text: "نقبل فيزا، ماستركارد، ومدى. دفع آمن ومشفّر بالكامل." },
  { icon: "", title: "Apple Pay", text: "ادفعي بلمسة واحدة عبر Apple Pay بسرعة وأمان." },
  { icon: "📱", title: "STC Pay", text: "ادفعي بسهولة عبر محفظة STC Pay الرقمية." },
];

export default function PaymentPage() {
  return (
    <InfoPage
      title="طرق الدفع"
      icon="💳"
      subtitle="خيارات دفع متعددة وآمنة تناسب الجميع"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {methods.map((m) => (
          <div key={m.title} className="flex items-start gap-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blush-50 text-2xl">
              {m.icon}
            </span>
            <div>
              <h3 className="font-bold text-plum-900">{m.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-plum-900/70">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Section title="🔒 دفع آمن ومضمون">
        <p>
          نستخدم أحدث تقنيات التشفير لحماية بياناتك المالية. جميع المعاملات تتم عبر
          بوابات دفع آمنة معتمدة، ولا نقوم بتخزين بيانات بطاقتك الائتمانية.
        </p>
        <p>
          في حال واجهتِ أي مشكلة أثناء الدفع، لا تترددي في{" "}
          <Link href="/pages/contact" className="font-bold text-blush-600 hover:underline">
            التواصل معنا
          </Link>{" "}
          وسيسعد فريقنا بمساعدتك.
        </p>
      </Section>

      <div className="rounded-3xl bg-gradient-to-l from-blush-100 to-champagne p-8 text-center">
        <p className="font-display text-xl font-bold text-plum-900">
          🎁 توصيل مجاني للطلبات فوق ٣٠٠ ر.س
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-full bg-gradient-to-l from-blush-500 to-blush-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blush-300/50 transition hover:opacity-90"
        >
          تسوّقي الآن
        </Link>
      </div>
    </InfoPage>
  );
}
