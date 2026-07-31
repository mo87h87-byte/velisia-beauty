# ملخص شامل — مراجعة velisia-beauty الكاملة (2026-07-31)

مرجع واحد لكل الجلسة دي: 5 مراحل، من تشديد الـCSP لحد مراجعة جودة الكود. لكل مرحلة: إيه اللي اتعمل، إيه اللي اتصلح فعلياً، وإيه اللي لسه مفتوح.

---

## المرحلة 1: تشديد CSP + فحص أمني خارجي

**اتعمل:**
- كل الـ`style={{...}}` (inline JSX style attributes) في المكونات اتحولت لـTailwind classes أو `useInlineStyle` hook أو `ref` callbacks — 6 ملفات.
- الـ`<style>` tags الثابتة (hero gradient, pearl shimmer) اتنقلت من `page.tsx`/`Header.tsx` لـ`globals.css`، والنسخة المكررة في `Header.tsx` اتحذفت.
- فحص خارجي عبر 4 أدوات مستقلة (تفاصيل كاملة في [SECURITY-AUDIT.md](SECURITY-AUDIT.md)): Mozilla Observatory رجّع **B+ (80/100)**، securityheaders.com وSSL Labs اتحجبوا (Cloudflare/حماية سكانرز)، Sucuri مفيهوش API رسمي مجاني.
- أضفت `review`/`aggregateRating` لبيانات الـJSON-LD في صفحة المنتج (Google Rich Results كان بيشتكي منهم مفقودين).

**قرار مفتوح ومقبول (مش هيتغير غير لو ظهر سبب جديد):**
- `style-src 'unsafe-inline'` باقي — بسبب theme colors/font override الديناميكيين في `layout.tsx`، مش قابلين للنقل لملف ثابت.
- `script-src 'unsafe-inline'` باقي — Next.js نفسها بتحتاجه لسكريبتات الـhydration، وإزالته تتطلب نظام nonce كامل + تحويل صفحات ثابتة كتير لـdynamic rendering. التريد-أوف مش مستاهل حالياً (تفاصيل كاملة في الذاكرة `project-security-headers-moyasar`).

---

## المرحلة 2: اختبار تحمل الضغط (k6)

**اتعمل:** تفاصيل كاملة في [LOAD-TEST-RESULTS.md](LOAD-TEST-RESULTS.md).
- طلبات متتالية (GET بس، الصفحة الرئيسية بس): 10 → 20 → 50 → 100 طلب. **صفر فشل** في كل الحالات، متوسط استجابة استقر حوالين 700-780ms بعد أول تجربة (cold start).
- طلبات متزامنة: 10 → 20 طلب في نفس اللحظة. **صفر فشل** برضو، بس زمن الاستجابة أبطأ بوضوح (~2-3.4 ثانية) تحت التزامن — متوقع لصفحة SSR كاملة.

**النتيجة:** الموقع بيتحمل الحمل المحدود اللي اتفحص من غيره أي مشكلة. الفحص كان محدود عمداً (GET بس، الصفحة الرئيسية بس، أرقام صغيرة) — مش اختبار تحمل شامل.

---

## المرحلة 3: مراجعة الدفع والطلبات والشحن — المشكلة الأهم اللي اتصلحت

**المشكلة الأصلية:** طلبات البطاقة كانت بتتكتب في قاعدة البيانات **بعد** تأكيد الدفع بس — لو العميل قفل المتصفح أو فشل الدفع نص الطريق، الطلب كان **بيختفي تماماً** من غير أي أثر.

**الحل اللي اتنفذ (3 طبقات حماية):**

1. **إنشاء الطلب قبل التحويل لـMoyasar** ([commit 132da34](https://github.com/mo87h87-byte/velisia-beauty/commit/132da34)): الطلب بيتكتب فوراً بحالة جديدة `awaiting_payment` قبل ما `Moyasar.init()` حتى يتنادى. لما العميل يرجع، `POST /api/orders/confirm-payment` بيحدّث **نفس الصف** (مش صف جديد) بعد تحقق حقيقي من Moyasar.
2. **Moyasar webhook حقيقي** ([commit 689439a](https://github.com/mo87h87-byte/velisia-beauty/commit/689439a)): `/api/webhooks/moyasar` مسجّل فعلياً عبر Moyasar API الرسمي (event: `payment_paid`)، بيحدّث الطلب حتى لو العميل ما رجعش للموقع خالص. الـsecret متخزن في Vercel production.
3. **Cron احتياطي يومي** ([commit 23fd52f](https://github.com/mo87h87-byte/velisia-beauty/commit/23fd52f)): `/api/cron/reconcile-payments` بيدوّر يومياً على أي طلب `awaiting_payment` أقدم من ساعة، يسأل Moyasar مباشرة (عبر `moyasar_payment_id` المحفوظ من `on_completed` callback)، ويأكد أو يلغي حسب النتيجة — وبيسيب الطلب زي ما هو لو الاستعلام مش واضح (تحوّط ضد إلغاء طلب مدفوع فعلاً).

**اتفحص:** الفلو الكامل محلياً وعلى الإنتاج ببيانات تجريبية، اتحذفت فوراً بعد كل اختبار.

**مفتوح:** الـwebhook لسه مش اتفحص مع دفعة Moyasar حقيقية فعلية (يحتاج أول عملية دفع حقيقية تعدي، أو دفعة تجريبية كاملة من Moyasar نفسها).

---

## المرحلة 4: التوسع المستقبلي (تحليل بس، من غير أي تعديل)

- **فهرسة قاعدة البيانات:** الأعمدة الأساسية (`id`, `slug`, `orderNumber`, `email`) مفهرسة صح. لكن `orders.status`، `orders.createdAt`، `products.category`، و`reviews.productId` (foreign key) **مش مفهرسين خالص**. مش مشكلة حالياً (7 طلبات، 5 منتجات، 0 مراجعات) — لكن أول حاجة تتفهرس لو الكتالوج كبر.
- **حدود Vercel Hobby:** الـcrons بقت 100 مسموحين (اتغيّر من حد قديم كان 2) — إحنا عندنا 3 بس، مفيش مشكلة عدد. القيد الحقيقي الباقي: كل cron مرة واحدة باليوم بس. باقي الحدود (bandwidth, invocations, CPU) بعيدين عنها جداً بحجم الموقع الحالي، بس الأرقام الفعلية محتاجة تتشاف من لوحة Vercel نفسها (مش متاحة عبر CLI).
- **جاهزية bundles/subscription boxes:** الـbundles إضافة خفيفة نسبياً (الطلبات متخزنة كـJSON snapshot مرن، مش صفوف مربوطة بـforeign key). الـsubscriptions غياب معماري حقيقي — مفيش جدول `subscriptions`، مفيش آلية دفع متكرر، ومفيش تأكيد إن Moyasar أصلاً بتدعم دفعات متكررة (سؤال مفتوح يحتاج تحقق من توثيقهم الحي وقت التخطيط الفعلي).

---

## المرحلة 5: جودة الكود (تحليل بس، من غير أي تعديل)

### 🔴 أولوية عالية — لسه مفتوحة، تستاهل معالجة قريبة
**معالجة أخطاء غير متسقة، خصوصاً على مسار الدفع.** أغلب الـAPI routes بتـ"بلع" الأخطاء بصمت (`catch { return 500 }` من غير `console.error`) — يعني أي خطأ حقيقي مش هيظهر في logs الإنتاج. الأخطر إن ده واقع بالظبط على 3 routes الدفع الأهم:
- `src/app/api/orders/route.ts:131-133` (إنشاء الطلب)
- `src/app/api/orders/confirm-payment/route.ts:53-55` (تأكيد الدفع)
- `src/app/api/payments/verify/route.ts:37-39`

وكمان 3 routes مفيهاش `try/catch` خالص حوالين المنطق الأساسي (`admin/data`, `admin/upload`, `settings` العامة) — أي خطأ غير متوقع هيرجّع stack trace خام.

### 🟠 أولوية متوسطة-عالية — تكرار منطق
- مقارنة الـwebhook secret متكررة **4 مرات** رغم وجود helper جاهز (`timingSafeStringEqual` في `lib/auth.ts`) محدش بيستخدمه — حتى الكود التاني في نفس الملف.
- منطق التحقق من body الـwebhook مكرر (~15 سطر) بين `webhooks/payment` و`webhooks/shipping`.
- `clientKey()` لمعدل الطلبات مكررة حرفياً بين `admin/login` و`admin/verify-password`.
- منطق توقيع الـtoken مكرر بين نظامي auth المنفصلين (الأدمن والعميل)، وكمان الاتنين بيقروا نفس متغير البيئة `ADMIN_SECRET` رغم إنهم كيانين مختلفين منطقياً.

### 🟡 أولوية متوسطة — كود ميت (مرشحين، محتاجين تأكيد قبل الحذف)
- `src/components/Hero.tsx` و`src/components/ProductCarousel.tsx` — مفيش أي import ليهم في المشروع.
- 3 دوال في `lib/products.ts` (`getFeaturedProducts`, `getNewArrivals`, `getRecommended`) مالهاش أي مستخدِم.
- `ESCALATION_REASONS` في `lib/email-knowledge.ts` مُصدَّرة بس مش مستخدَمة.

### 🟢 أولوية منخفضة — مشاكل lint موجودة فعلياً
- **9 حالات** (مش 3 زي ما كان متسجل قبل كده) من نمط `react-hooks/set-state-in-effect` منتشر في المشروع — يستاهل جولة تنظيف مخصصة.
- `Date.now()` بينادى وقت الـrender في `AdminDashboardClient.tsx:56` (impure function).
- `<a>` عادي بدل `next/link` في `ProductDetail.tsx:56` — ده ممكن يكون **باگ حقيقي** (بيكسر client-side navigation، مش بس تنظيف).

### ✅ نضيف
مفيش أي TODO/FIXME/HACK في الكود خالص.

---

## خلاصة الأولويات للمستقبل

لو محتاجين نرتب شغل قادم من الملخص ده:
1. **إصلاح `<a>` بدل `next/link` في `ProductDetail.tsx`** — الأسرع والأكيد إنه باگ حقيقي.
2. **توحيد معالجة الأخطاء** خصوصاً على الـ3 routes بتاعة الدفع (إضافة `console.error` + مراجعة الـ3 routes من غير try/catch).
3. **توحيد مقارنة الـwebhook secret** على `timingSafeStringEqual` الموجودة أصلاً.
4. **فهرسة `orders.status`/`orders.createdAt`/`products.category`/`reviews.productId`** قبل ما الكتالوج يكبر.
5. **حذف الكود الميت** بعد تأكيد إنه مش محتفظ بيه عمداً (`Hero.tsx`, `ProductCarousel.tsx`, الدوال التلاتة في `products.ts`).
