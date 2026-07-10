import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import { CATEGORIES } from "@/lib/constants";
import { getBestsellers, getNewArrivals } from "@/lib/products";

export const dynamic = "force-dynamic";

const features = [
  { icon: "🎧", title: "خدمة عملاء مميزة", text: "متاحة ٢٤/٧" },
  { icon: "📦", title: "توصيل سريع", text: "من ١ إلى ٣ أيام" },
  { icon: "🛡️", title: "منتجات أصلية ١٠٠٪", text: "جودة مضمونة" },
  { icon: "💳", title: "دفع آمن", text: "خيارات دفع متعددة" },
  { icon: "🎁", title: "جمّعي النقاط", text: "واحصلي على مكافآت" },
];

export default async function HomePage() {
  const [bestsellers, newArrivals] = await Promise.all([
    getBestsellers(),
    getNewArrivals(),
  ]);

  return (
    <div>
      <Hero />

      {/* Category circles */}
      <section className="mx-auto -mt-6 max-w-7xl px-4">
        <div className="rounded-3xl border border-blush-100 bg-white p-6 shadow-lg shadow-blush-100/50">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-8">
            {CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/products?category=${c.key}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blush-100 to-champagne text-2xl shadow-sm transition group-hover:scale-110 group-hover:shadow-md sm:h-20 sm:w-20 sm:text-3xl">
                  {c.icon}
                </span>
                <span className="text-[11px] font-semibold text-plum-900 group-hover:text-blush-600 sm:text-xs">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banners */}
      <section className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 md:grid-cols-3">
        <div className="flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blush-200 to-blush-300 p-7">
          <span className="text-sm font-bold text-plum-800">عروض الأسبوع</span>
          <p className="mt-1 font-display text-3xl font-bold text-plum-900">
            خصومات تصل إلى
            <br />
            <span className="text-4xl text-blush-700">٥٠٪</span>
          </p>
          <Link
            href="/products?category=offers"
            className="mt-4 w-fit rounded-full bg-plum-800 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-plum-900"
          >
            تسوّقي الآن
          </Link>
        </div>
        <div className="flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-champagne to-blush-100 p-7">
          <span className="text-sm font-bold text-rose-gold">باقات الجمال</span>
          <p className="mt-1 font-display text-2xl font-bold text-plum-900">
            منتجات مختارة بسعر أفضل
          </p>
          <p className="mt-1 text-sm text-plum-900/60">وفّري أكثر مع باقاتنا المميزة</p>
          <Link
            href="/products"
            className="mt-4 w-fit rounded-full bg-blush-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blush-600"
          >
            اكتشفي الباقات
          </Link>
        </div>
        <div className="flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-plum-800 to-blush-800 p-7 text-white">
          <span className="text-sm font-bold text-blush-200">جديدنا وصل</span>
          <p className="mt-1 font-display text-2xl font-bold">
            أحدث المنتجات من الماركات العالمية
          </p>
          <Link
            href="/products?category=makeup"
            className="mt-4 w-fit rounded-full bg-white px-6 py-2.5 text-sm font-bold text-plum-900 transition hover:bg-blush-100"
          >
            تسوّقي الجديد
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div className="text-center sm:text-right">
            <span className="text-sm font-bold text-blush-500">— الأكثر مبيعاً —</span>
            <h2 className="font-display text-3xl font-bold text-plum-900">الأكثر مبيعاً</h2>
          </div>
          <Link href="/products" className="shrink-0 text-sm font-bold text-blush-600 hover:underline">
            عرض الكل ←
          </Link>
        </div>
        <ProductCarousel products={bestsellers} />
      </section>

      {/* New arrivals */}
      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div className="text-center sm:text-right">
            <span className="text-sm font-bold text-blush-500">— وصل حديثاً —</span>
            <h2 className="font-display text-3xl font-bold text-plum-900">جديدنا</h2>
          </div>
          <Link href="/products" className="shrink-0 text-sm font-bold text-blush-600 hover:underline">
            عرض الكل ←
          </Link>
        </div>
        <ProductCarousel products={newArrivals} />
      </section>

      {/* Features */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="grid gap-4 rounded-3xl border border-blush-100 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush-50 text-2xl">
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-plum-900">{f.title}</p>
                <p className="text-xs text-plum-900/60">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
