"use client";

import { useState } from "react";

const faqs = [
  { q: "كم تستغرق مدة التوصيل؟", a: "يتم توصيل الطلبات خلال ١ إلى ٣ أيام عمل داخل المدن الرئيسية، وقد تصل إلى ٥ أيام للمناطق النائية. ستصلك رسالة بتفاصيل الشحن بمجرد تجهيز طلبك." },
  { q: "هل المنتجات أصلية ١٠٠٪؟", a: "نعم، جميع منتجاتنا أصلية ١٠٠٪ ومستوردة من الماركات العالمية المعتمدة. نضمن لكِ الجودة والأصالة في كل منتج." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نوفّر الدفع عند الاستلام، البطاقات الائتمانية ومدى، Apple Pay، و STC Pay. جميع المعاملات آمنة ومشفّرة." },
  { q: "هل يمكنني إرجاع منتج؟", a: "نعم، يمكنك الإرجاع خلال ١٤ يوماً من الاستلام بشرط أن يكون المنتج بحالته الأصلية وغير مستخدم. راجعي صفحة سياسة الإرجاع للتفاصيل." },
  { q: "هل التوصيل مجاني؟", a: "التوصيل مجاني لجميع الطلبات التي تتجاوز ٣٠٠ ر.س. أما الطلبات الأقل فتُضاف رسوم شحن رمزية قدرها ٢٥ ر.س." },
  { q: "كيف أتتبع طلبي؟", a: "بمجرد شحن طلبك ستصلك رسالة تحتوي على رقم التتبع. يمكنك أيضاً التواصل مع خدمة العملاء لمعرفة حالة طلبك في أي وقت." },
  { q: "هل تشحنون لجميع مدن المملكة؟", a: "نعم، نوصّل إلى جميع مدن ومناطق المملكة العربية السعودية." },
  { q: "كيف أستفيد من نقاط المكافآت؟", a: "تحصلين على نقاط مع كل عملية شراء يمكن استبدالها بخصومات على طلباتك القادمة. كلما تسوّقتِ أكثر، ربحتِ أكثر!" },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="overflow-hidden rounded-2xl border border-blush-100 bg-white shadow-sm">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-right"
            >
              <span className="font-bold text-plum-900">{f.q}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-blush-500 transition ${isOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-loose text-plum-900/70">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
