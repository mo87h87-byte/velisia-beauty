import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";

// ---------------------------------------------------------------------------
// إعدادات الحساب
// ---------------------------------------------------------------------------

const HISTORY_DAYS = 90; // فترة تحليل المبيعات
const COVER_MONTHS = 2; // نغطي مبيعات شهرين قادمين
const MIN_ORDER_QTY = 5; // أقل كمية منطقية للطلب
const DEFAULT_THRESHOLD = 10; // حد المخزون المنخفض (نفس لوحة التحكم)

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const url = new URL(request.url);
    const threshold =
      Number(url.searchParams.get("threshold")) || DEFAULT_THRESHOLD;

    const [allOrders, allProducts] = await Promise.all([
      db.select().from(orders),
      db.select().from(products),
    ]);

    // مبيعات آخر 90 يوم لكل منتج
    const since = Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000;
    const soldMap = new Map<number, number>();

    for (const order of allOrders) {
      if (order.status === "cancelled") continue;
      if (new Date(order.createdAt).getTime() < since) continue;

      const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
      for (const item of items) {
        const id = Number(item.id);
        if (!id) continue;
        soldMap.set(id, (soldMap.get(id) ?? 0) + (Number(item.quantity) || 0));
      }
    }

    const months = HISTORY_DAYS / 30;

    const list = allProducts
      .filter((p) => p.stock <= threshold)
      .map((p) => {
        const sold = soldMap.get(p.id) ?? 0;
        const monthlyAvg = Math.round((sold / months) * 10) / 10;

        // الكمية المقترحة: تغطية شهرين ناقص المخزون الحالي
        const target = Math.ceil(monthlyAvg * COVER_MONTHS);
        const suggested = Math.max(MIN_ORDER_QTY, target - p.stock);

        // أيام تقريبية قبل نفاد المخزون
        const dailyAvg = monthlyAvg / 30;
        const daysLeft =
          dailyAvg > 0 ? Math.floor(p.stock / dailyAvg) : null;

        let urgency: "critical" | "high" | "normal" = "normal";
        if (p.stock === 0) urgency = "critical";
        else if (daysLeft !== null && daysLeft <= 14) urgency = "critical";
        else if (daysLeft !== null && daysLeft <= 30) urgency = "high";

        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          stock: p.stock,
          soldLast90Days: sold,
          monthlyAvg,
          suggestedQty: suggested,
          daysLeft,
          urgency,
        };
      })
      .sort((a, b) => {
        const rank = { critical: 0, high: 1, normal: 2 };
        if (rank[a.urgency] !== rank[b.urgency]) {
          return rank[a.urgency] - rank[b.urgency];
        }
        return a.stock - b.stock;
      });

    return NextResponse.json({
      threshold,
      historyDays: HISTORY_DAYS,
      coverMonths: COVER_MONTHS,
      generatedAt: new Date().toISOString(),
      totalItems: list.length,
      totalUnits: list.reduce((s, i) => s + i.suggestedQty, 0),
      items: list,
    });
  } catch (error) {
    console.error("خطأ في قائمة إعادة التخزين:", error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}