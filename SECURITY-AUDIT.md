# فحص أمني خارجي — velisiabeauty.com

تاريخ الفحص: 2026-07-31
النطاق: `velisiabeauty.com` / `www.velisiabeauty.com` (Vercel + Cloudflare)

فحص عبر 4 أدوات خارجية مستقلة، كل واحدة اتصلنا بيها مباشرة (API لو متاح، وإلا browser)، بالترتيب التالي:

## 1. securityheaders.com
- **الحالة: اتحجب.**
- مفيش API رسمي موثّق لهذه الأداة.
- محاولة الوصول المباشر عبر المتصفح رجّعت صفحة حجب من Cloudflare:
  > "Sorry, you have been blocked — Cloudflare Ray ID: a23ae0434c13e19e"
- نفس النتيجة اللي حصلت في فحص سابق (2026-07-30).

## 2. SSL Labs (Qualys)
- **الحالة: الاتصال نجح (API الرسمي اشتغل)، لكن الفحص فشل يكمل.**
- استخدمنا الـ API الرسمي: `https://api.ssllabs.com/api/v3/analyze?host=velisiabeauty.com`
- الرد النهائي (`status: READY`):
  ```json
  {"host":"velisiabeauty.com","port":443,"protocol":"http","isPublic":false,"status":"READY","startTime":1785482907646,"testTime":1785482926751,"engineVersion":"2.4.2","criteriaVersion":"2009q","cacheExpiryTime":1785483526751,"endpoints":[{"ipAddress":"216.198.79.1","statusMessage":"Unexpected failure","statusDetails":"TESTING_ECDHE_PARAMETER_REUSE","statusDetailsMessage":"Testing ECDHE parameter reuse","progress":83,"duration":19010,"eta":5,"delegation":1}]}
  ```
- الـ endpoint الوحيد اللي اتفحص (`216.198.79.1`) فشل بحالة `"Unexpected failure"` أثناء مرحلة `TESTING_ECDHE_PARAMETER_REUSE` — **مفيش grade نهائي**. الأرجح إن السبب حماية Cloudflare/Vercel ضد سكانرز SSL الآلية (نفس النمط اللي واجهناه في الفحص السابق 2026-07-26).

## 3. Mozilla Observatory
- **الحالة: نجح بالكامل.**
- API رسمي: `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=velisiabeauty.com` (POST) و `/api/v2/analyze?host=` (GET للتفاصيل الكاملة).
- **النتيجة: Grade B+، Score 80/100** (9 اختبارات نجحت من أصل 10).
- **الاختبار الوحيد الفاشل:** `content-security-policy` — بسبب `'unsafe-inline'` في `script-src`/`style-src` (`score_modifier: -20`). ده قرار معروف ومقبول من قبل، مرتبط بمتطلبات ودجت Moyasar للدفع — راجع `[[project-security-headers-moyasar]]` في الذاكرة للتفاصيل الكاملة والتريد-أوف.
- باقي الاختبارات كلها ناجحة: HSTS (max-age=63072000 + preload + includeSubDomains)، X-Frame-Options (عبر CSP frame-ancestors)، X-Content-Type-Options: nosniff، Referrer-Policy: strict-origin-when-cross-origin، إعادة التوجيه لـ HTTPS، عدم وجود CORS مفتوح.
- ملاحظات غير حرجة (مفيهاش خصم نقاط): مفيش Subresource Integrity (SRI)، مفيش Cross-Origin-Resource-Policy مضبوط صراحة.

## 4. Sucuri SiteCheck
- **الحالة: متاحش نفحص — مفيش API رسمي عام.**
- الـ API الرسمي بتاع Sucuri مخصص فقط لعملاء عندهم حساب/باقة مدفوعة (WAF أو Malware Removal) مربوط بمفتاح API — مش سيناريو فحص مجاني لأي دومين.
- endpoint المستخدم في صفحة الفحص المجاني (`sitecheck.sucuri.net`) داخلي وغير موثّق للاستخدام البرمجي من طرف تالت، فاتقرر عدم استخدامه.
- **لم يتم إجراء فحص malware/اختراق آلي لهذا النطاق.** لو محتاجين الفحص ده مستقبلاً، الخيار الوحيد المتاح هو الفحص اليدوي عبر الموقع (`sitecheck.sucuri.net`) في متصفح المستخدم، أو الاشتراك في باقة Sucuri مدفوعة.

## الخلاصة

| الأداة | الحالة | النتيجة |
|---|---|---|
| securityheaders.com | اتحجب (Cloudflare) | — |
| SSL Labs | اتصل، فشل الفحص | مفيش grade (`Unexpected failure`) |
| Mozilla Observatory | نجح | **B+ (80/100)** |
| Sucuri SiteCheck | مفيش API رسمي | لم يُفحص |

**أقوى نتيجة موثوقة عندنا حالياً هي Mozilla Observatory (B+)،** والمشكلة الوحيدة المسجلة فيها (`unsafe-inline` في الـ CSP) قرار مقبول ومسبق. باقي الأدوات إما محجوبة أو مش قابلة للفحص الآلي من هذه البيئة — لو الفحص الكامل (SSL grade + malware scan) مطلوب فعلاً، الطريق البديل هو تشغيلهم يدوياً من متصفح المستخدم نفسه.
