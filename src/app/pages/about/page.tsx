import type { Metadata } from "next";
import InfoPage, { Section } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "من نحن | velisiabeauty",
  description: "تعرّفي على قصة velisiabeauty ورسالتنا في عالم الجمال والعناية.",
};

const values = [
  { icon: "💎", title: "منتجات أصلية", text: "نضمن أصالة ١٠٠٪ لكل منتج نبيعه من الماركات العالمية المعتمدة." },
  { icon: "🌿", title: "جودة مختارة", text: "نختار بعناية كل منتج ليواكب أعلى معايير الجمال والعناية." },
  { icon: "💗", title: "عملاؤنا أولاً", text: "رضاكِ هو غايتنا، وفريقنا متاح دائماً لخدمتك ومساعدتك." },
  { icon: "🚚", title: "توصيل موثوق", text: "نوصل طلبك بسرعة وأمان إلى باب منزلك في جميع أنحاء المملكة." },
];

export default function AboutPage() {
  return (
    <InfoPage
      title="من نحن"
      icon="🌸"
      subtitle="velisiabeauty وجهتكِ الأولى للجمال والعناية الفاخرة"
    >
      <Section title="قصتنا">
        <p>
          انطلقت <strong>velisiabeauty</strong> من شغفٍ حقيقي بعالم الجمال والعناية،
          برؤية واضحة: أن نجعل أرقى منتجات التجميل والعناية بالبشرة والشعر والعطور
          العالمية في متناول كل امرأة عربية. نؤمن أن جمالكِ يستحق الأفضل، ولهذا
          نحرص على انتقاء كل منتج بعناية فائقة من أشهر الماركات الموثوقة حول العالم.
        </p>
        <p>
          منذ تأسيسنا، خدمنا آلاف العميلات اللواتي وثقن بنا، وما زلنا نسعى كل يوم
          لتقديم تجربة تسوّق استثنائية تجمع بين الفخامة والسهولة والثقة.
        </p>
      </Section>

      <Section title="رسالتنا">
        <p>
          أن نُلهم كل امرأة لتعتني بجمالها وتعبّر عن أسلوبها الخاص، من خلال توفير
          منتجات أصلية عالية الجودة، وخدمة عملاء مميزة، وتجربة تسوّق آمنة وممتعة.
        </p>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush-50 text-2xl">
              {v.icon}
            </span>
            <h3 className="mt-3 font-bold text-plum-900">{v.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-plum-900/70">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl bg-gradient-to-l from-plum-800 to-blush-800 p-8 text-center text-white sm:grid-cols-3">
        <div>
          <p className="font-display text-3xl font-bold">+١٠٠٠٠</p>
          <p className="text-sm text-blush-200">عميلة سعيدة</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold">+٥٠٠</p>
          <p className="text-sm text-blush-200">منتج فاخر</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold">٤.٩★</p>
          <p className="text-sm text-blush-200">تقييم العملاء</p>
        </div>
      </div>
    </InfoPage>
  );
}
