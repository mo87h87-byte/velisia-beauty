import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | velisiabeauty",
  description: "إجابات على أكثر الأسئلة شيوعاً حول التسوّق في velisiabeauty.",
};

export default function FaqPage() {
  return (
    <InfoPage
      title="الأسئلة الشائعة"
      icon="❓"
      subtitle="كل ما تحتاجين معرفته عن التسوّق معنا"
    >
      <FaqAccordion />

      <div className="mt-8 rounded-3xl bg-gradient-to-l from-plum-800 to-blush-800 p-8 text-center text-white">
        <p className="font-display text-xl font-bold">لم تجدي إجابتك؟</p>
        <p className="mt-1 text-sm text-blush-200">فريق خدمة العملاء جاهز لمساعدتك</p>
        <Link
          href="/pages/contact"
          className="mt-4 inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-plum-900 transition hover:bg-blush-100"
        >
          تواصلي معنا
        </Link>
      </div>
    </InfoPage>
  );
}
