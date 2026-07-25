import { NextResponse } from "next/server";
import { getGmailClient } from "@/lib/gmail";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { toNumber } from "@/lib/format";

// ---------------------------------------------------------------------------
// إعدادات عامة
// ---------------------------------------------------------------------------

const REPORT_DAY = 6; // السبت (0 = الأحد)
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC+3
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK_LIMIT = 10; // نفس شرط لوحة التحكم

interface OrderItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

// ---------------------------------------------------------------------------
// أدوات مساعدة
// ---------------------------------------------------------------------------

function riyadhNow(): Date {
  return new Date(Date.now() + RIYADH_OFFSET_MS);
}

function formatSAR(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(date: Date): string {
  const d = new Date(date.getTime() + RIYADH_OFFSET_MS);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

function changeBadge(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return `<span style="color:#9ca3af;">—</span>`;
    return `<span style="color:#16a34a;">جديد ▲</span>`;
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct);
  if (rounded > 0) return `<span style="color:#16a34a;">▲ ${rounded}%</span>`;
  if (rounded < 0) return `<span style="color:#dc2626;">▼ ${Math.abs(rounded)}%</span>`;
  return `<span style="color:#9ca3af;">= 0%</span>`;
}

// ---------------------------------------------------------------------------
// بناء التقرير
// ---------------------------------------------------------------------------

async function buildReport() {
  const [allOrders, allProducts] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(products),
  ]);

  const now = Date.now();
  const weekStart = now - WEEK_MS;
  const prevWeekStart = now - WEEK_MS * 2;

  const inRange = (o: (typeof allOrders)[number], from: number, to: number) => {
    const t = new Date(o.createdAt).getTime();
    return t >= from && t < to;
  };

  const thisWeek = allOrders.filter((o) => inRange(o, weekStart, now));
  const lastWeek = allOrders.filter((o) => inRange(o, prevWeekStart, weekStart));

  const sumTotal = (list: typeof allOrders) =>
    list.reduce((s, o) => s + toNumber(o.total), 0);

  const paidOnly = (list: typeof allOrders) =>
    list.filter((o) => o.paymentStatus === "paid");

  const thisRevenue = sumTotal(thisWeek);
  const lastRevenue = sumTotal(lastWeek);
  const thisPaid = sumTotal(paidOnly(thisWeek));
  const lastPaid = sumTotal(paidOnly(lastWeek));
  const avgOrder = thisWeek.length > 0 ? thisRevenue / thisWeek.length : 0;
  const lastAvgOrder = lastWeek.length > 0 ? lastRevenue / lastWeek.length : 0;

  // ---- أفضل المنتجات مبيعاً خلال الأسبوع ----
  const productMap = new Map<
    string,
    { name: string; brand: string; quantity: number; revenue: number }
  >();

  for (const order of thisWeek) {
    const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
    for (const item of items) {
      const key = String(item.id ?? item.name);
      const existing = productMap.get(key);
      const qty = Number(item.quantity) || 0;
      const revenue = (Number(item.price) || 0) * qty;
      if (existing) {
        existing.quantity += qty;
        existing.revenue += revenue;
      } else {
        productMap.set(key, {
          name: String(item.name ?? "غير معروف"),
          brand: String(item.brand ?? ""),
          quantity: qty,
          revenue,
        });
      }
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const totalUnits = Array.from(productMap.values()).reduce(
    (s, p) => s + p.quantity,
    0,
  );

  // ---- المخزون المنخفض ----
  const lowStock = allProducts
    .filter((p) => p.stock <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
    .map((p) => ({ name: p.name, brand: p.brand, stock: p.stock }));

  // ---- الطلبات المعلّقة في الدفع ----
  const stalePending = allOrders
    .filter(
      (o) =>
        o.paymentStatus === "pending" &&
        o.status !== "cancelled" &&
        now - new Date(o.createdAt).getTime() > ONE_DAY_MS,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .slice(0, 10);

  return {
    periodFrom: formatDate(new Date(weekStart)),
    periodTo: formatDate(new Date(now)),
    orderCount: thisWeek.length,
    lastOrderCount: lastWeek.length,
    revenue: thisRevenue,
    lastRevenue,
    paidRevenue: thisPaid,
    lastPaidRevenue: lastPaid,
    avgOrder,
    lastAvgOrder,
    totalUnits,
    topProducts,
    lowStock,
    stalePending,
  };
}

// ---------------------------------------------------------------------------
// قالب الإيميل
// ---------------------------------------------------------------------------

function buildHtml(r: Awaited<ReturnType<typeof buildReport>>): string {
  const statCard = (
    label: string,
    value: string,
    current: number,
    previous: number,
  ) => `
    <td style="padding:14px 10px;background:#fdf2f6;border-radius:10px;text-align:center;width:25%;">
      <div style="font-size:12px;color:#9b7280;margin-bottom:6px;">${label}</div>
      <div style="font-size:19px;font-weight:bold;color:#7a2440;">${value}</div>
      <div style="font-size:12px;margin-top:5px;">${changeBadge(current, previous)}</div>
    </td>`;

  const topRows =
    r.topProducts.length > 0
      ? r.topProducts
          .map(
            (p, i) => `
        <tr style="border-bottom:1px solid #f3e3ea;">
          <td style="padding:10px 8px;color:#b9899c;font-size:13px;">${i + 1}</td>
          <td style="padding:10px 8px;font-size:14px;color:#3f2530;">
            ${p.name}
            ${p.brand ? `<div style="font-size:11px;color:#a08b95;">${p.brand}</div>` : ""}
          </td>
          <td style="padding:10px 8px;text-align:center;font-size:14px;color:#3f2530;">${p.quantity}</td>
          <td style="padding:10px 8px;text-align:left;font-size:13px;color:#7a2440;white-space:nowrap;">${formatSAR(p.revenue)}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#a08b95;font-size:14px;">لا توجد مبيعات هذا الأسبوع</td></tr>`;

  const lowStockRows =
    r.lowStock.length > 0
      ? r.lowStock
          .map(
            (p) => `
        <tr style="border-bottom:1px solid #f6e6cf;">
          <td style="padding:9px 8px;font-size:14px;color:#3f2530;">
            ${p.name}
            ${p.brand ? `<div style="font-size:11px;color:#a08b95;">${p.brand}</div>` : ""}
          </td>
          <td style="padding:9px 8px;text-align:left;font-size:14px;font-weight:bold;color:${
            p.stock === 0 ? "#dc2626" : "#c2820a"
          };white-space:nowrap;">${p.stock === 0 ? "نفد المخزون" : `${p.stock} قطعة`}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="2" style="padding:16px;text-align:center;color:#16a34a;font-size:14px;">المخزون بحالة جيدة ✅</td></tr>`;

  const pendingBlock =
    r.stalePending.length > 0
      ? `
    <h3 style="font-size:15px;color:#7a2440;margin:26px 0 10px;">⏰ طلبات بانتظار الدفع (${r.stalePending.length})</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff8f0;border-radius:10px;">
      ${r.stalePending
        .map((o) => {
          const days = Math.floor(
            (Date.now() - new Date(o.createdAt).getTime()) / ONE_DAY_MS,
          );
          return `<tr style="border-bottom:1px solid #f6e6cf;">
            <td style="padding:9px 10px;font-size:13px;color:#3f2530;">
              ${o.orderNumber}
              <div style="font-size:11px;color:#a08b95;">${o.customerName}</div>
            </td>
            <td style="padding:9px 10px;text-align:center;font-size:12px;color:#c2820a;white-space:nowrap;">منذ ${days} يوم</td>
            <td style="padding:9px 10px;text-align:left;font-size:13px;color:#7a2440;white-space:nowrap;">${formatSAR(toNumber(o.total))}</td>
          </tr>`;
        })
        .join("")}
    </table>`
      : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f4f5;font-family:Tahoma,Arial,sans-serif;" dir="rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">

        <tr>
          <td style="background:linear-gradient(135deg,#c96a8c,#7a2440);padding:26px 24px;text-align:center;">
            <div style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">Velisia Beauty</div>
            <div style="font-size:14px;color:#f6dbe4;margin-top:6px;">التقرير الأسبوعي للمبيعات</div>
            <div style="font-size:12px;color:#eec3d2;margin-top:4px;">${r.periodFrom} — ${r.periodTo}</div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px;">

            <table width="100%" cellpadding="0" cellspacing="6" style="border-collapse:separate;">
              <tr>
                ${statCard("الطلبات", String(r.orderCount), r.orderCount, r.lastOrderCount)}
                ${statCard("إجمالي المبيعات", formatSAR(r.revenue), r.revenue, r.lastRevenue)}
              </tr>
              <tr>
                ${statCard("المبالغ المحصّلة", formatSAR(r.paidRevenue), r.paidRevenue, r.lastPaidRevenue)}
                ${statCard("متوسط الطلب", formatSAR(r.avgOrder), r.avgOrder, r.lastAvgOrder)}
              </tr>
            </table>

            <p style="font-size:12px;color:#a08b95;text-align:center;margin:12px 0 0;">
              النسب مقارنة بالأسبوع السابق · إجمالي القطع المباعة: ${r.totalUnits}
            </p>

            <h3 style="font-size:15px;color:#7a2440;margin:26px 0 10px;">🏆 الأكثر مبيعاً هذا الأسبوع</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr style="background:#fdf2f6;">
                <th style="padding:9px 8px;text-align:right;font-size:12px;color:#9b7280;font-weight:normal;">#</th>
                <th style="padding:9px 8px;text-align:right;font-size:12px;color:#9b7280;font-weight:normal;">المنتج</th>
                <th style="padding:9px 8px;text-align:center;font-size:12px;color:#9b7280;font-weight:normal;">الكمية</th>
                <th style="padding:9px 8px;text-align:left;font-size:12px;color:#9b7280;font-weight:normal;">الإيراد</th>
              </tr>
              ${topRows}
            </table>

            <h3 style="font-size:15px;color:#7a2440;margin:26px 0 10px;">⚠️ مخزون منخفض (${r.lowStock.length})</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff8f0;border-radius:10px;">
              ${lowStockRows}
            </table>

            ${pendingBlock}

            <div style="text-align:center;margin-top:30px;">
              <a href="https://velisiabeauty.com/admin"
                 style="display:inline-block;background:#7a2440;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:8px;font-size:14px;">
                فتح لوحة التحكم
              </a>
            </div>

          </td>
        </tr>

        <tr>
          <td style="background:#fdf2f6;padding:16px;text-align:center;font-size:11px;color:#a08b95;">
            تقرير تلقائي من نظام Velisia Beauty · يُرسل كل يوم سبت
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// المسار
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "1";

    // خطة Vercel Hobby تسمح بتشغيل يومي فقط، لذلك نفحص اليوم بأنفسنا
    const today = riyadhNow().getUTCDay();
    if (!force && today !== REPORT_DAY) {
      return NextResponse.json({
        skipped: true,
        reason: "التقرير يُرسل يوم السبت فقط",
        today,
      });
    }

    const report = await buildReport();
    const html = buildHtml(report);

    const to = process.env.REPORT_EMAIL || "mo87h87@gmail.com";
    const subjectText = `📊 تقرير مبيعات Velisia الأسبوعي — ${report.periodFrom} إلى ${report.periodTo}`;
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subjectText).toString("base64")}?=`;

    const raw = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(html, "utf-8").toString("base64"),
    ].join("\n");

    const encodedMessage = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const gmail = await getGmailClient();
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    return NextResponse.json({
      success: true,
      sentTo: to,
      period: `${report.periodFrom} — ${report.periodTo}`,
      orders: report.orderCount,
      revenue: report.revenue,
      topProduct: report.topProducts[0]?.name ?? null,
      lowStockCount: report.lowStock.length,
    });
  } catch (error) {
    console.error("خطأ في التقرير الأسبوعي:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء التقرير الأسبوعي" },
      { status: 500 },
    );
  }
}