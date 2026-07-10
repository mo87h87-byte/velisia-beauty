import type { Metadata } from "next";
import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "سياسة الإرجاع والاستبدال | velisiabeauty",
  description: "تعرّفي على سياسة الإرجاع والاستبدال في متجر velisiabeauty.",
};

const steps = [
  { n: "١", title: "قدّمي طلب الإرجاع", text: "تواصلي معنا خلال ١٤ يوماً من استلام الطلب عبر صفحة تواصلي معنا." },
  { n: "٢", title: "جهّزي المنتج", text: "تأكدي أن المنتج بحالته الأصلية وبتغليفه الكامل وغير مستخدم." },
  { n: "٣", title: "استلام المنتج", text: "سيقوم مندوبنا باستلام المنتج من عنوانك في الوقت المناسب لك." },
  { n: "٤", title: "استرداد المبلغ", text: "يتم رد المبلغ خلال ٥-٧ أيام عمل بنفس طريقة الدفع الأصلية." },
];

export default function ReturnsPage() {
  return (
    <InfoPage
      title="سياسة الإرجاع والاستبدال"
      icon="↩️"
      subtitle="رضاكِ أولويتنا — إرجاع سهل خلال ١٤ يوماً"
    >
      <Section title="شروط الإرجاع">
        <ul className="list-inside list-disc space-y-2">
          <li>يمكنكِ إرجاع أو استبدال المنتج خلال <strong>١٤ يوماً</strong> من تاريخ الاستلام.</li>
          <li>يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، وبكامل تغليفه وملحقاته.</li>
          <li>يجب إرفاق فاتورة الشراء أو رقم الطلب.</li>
          <li>لأسباب صحية، لا يمكن إرجاع منتجات المكياج والعناية بعد فتحها أو استخدامها.</li>
          <li>المنتجات المخفّضة ضمن العروض النهائية غير قابلة للإرجاع.</li>
        </ul>
      </Section>

      <h2 className="mb-4 font-display text-xl font-bold text-plum-900">خطوات الإرجاع</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="flex items-start gap-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-l from-blush-500 to-blush-600 font-bold text-white">
              {s.n}
            </span>
            <div>
              <h3 className="font-bold text-plum-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-plum-900/70">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Section title="المنتجات التالفة أو الخاطئة">
        <p>
          في حال وصل المنتج تالفاً أو مختلفاً عمّا طلبتِ، سنتحمّل كامل تكاليف
          الإرجاع ونوفّر لكِ بديلاً فورياً أو استرداداً كاملاً للمبلغ.
        </p>
        <p>
          للاستفسار عن أي طلب إرجاع،{" "}
          <Link href="/pages/contact" className="font-bold text-blush-600 hover:underline">
            تواصلي معنا
          </Link>
          .
        </p>
      </Section>
    </InfoPage>
  );
}
