import type { Metadata } from "next";
import Link from "next/link";
import InfoPage, { Section } from "@/components/InfoPage";
import { getShippingSettings } from "@/lib/shipping-settings";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "سياسة الشحن والتوصيل | velisiabeauty",
  description: "تعرّفي على سياسة الشحن والتوصيل في متجر velisiabeauty — الرسوم، المدة، والمناطق المخدومة.",
};

export default async function ShippingPage() {
  const { fee, freeThreshold } = await getShippingSettings();

  return (
    <InfoPage
      title="سياسة الشحن والتوصيل"
      icon="🚚"
      subtitle="نوصّل طلبك بسرعة وأمان إلى باب منزلك في جميع أنحاء المملكة"
    >
      <Section title="رسوم الشحن">
        <ul className="list-inside list-disc space-y-2">
          <li>رسوم الشحن {formatPrice(fee)} لكل الطلبات.</li>
          <li>شحن مجاني تلقائيًا للطلبات اللي تتجاوز {formatPrice(freeThreshold)}.</li>
        </ul>
      </Section>

      <Section title="مدة التوصيل">
        <p>
          يستغرق توصيل الطلب عادةً من <strong>١ إلى ٣ أيام عمل</strong> حسب منطقتك،
          ابتداءً من تأكيد الطلب. قد تطول هذه المدة قليلاً في المناسبات والمواسم ذات
          الطلب المرتفع، أو لأسباب خارجة عن إرادتنا (مثل الظروف الجوية أو التأخير لدى
          شركة الشحن).
        </p>
      </Section>

      <Section title="المناطق المخدومة">
        <p>
          نوصّل حاليًا إلى جميع مدن ومناطق المملكة العربية السعودية. بعض المناطق
          النائية قد تحتاج مدة توصيل أطول قليلاً من المتوسط المذكور أعلاه.
        </p>
      </Section>

      <Section title="تتبع طلبك">
        <p>
          بمجرد شحن طلبك، هتوصلك رسالة إشعار عبر البريد الإلكتروني، وتقدري تتابعي حالة
          طلبك في أي وقت من صفحة{" "}
          <Link href="/pages/track-order" className="font-bold text-blush-600 hover:underline">
            تتبع الطلب
          </Link>
          .
        </p>
        <p>
          لأي استفسار عن شحن طلبك،{" "}
          <Link href="/pages/contact" className="font-bold text-blush-600 hover:underline">
            تواصلي معنا
          </Link>
          .
        </p>
      </Section>
    </InfoPage>
  );
}
