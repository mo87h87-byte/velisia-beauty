import { db } from "@/db";
import { orders, products, reviews, messages, type Order, type Message } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { toNumber } from "./format";
import type { DashboardStats } from "./admin-types";

export type { DashboardStats } from "./admin-types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function getAllOrders(): Promise<Order[]> {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getAllMessages(): Promise<Message[]> {
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [allOrders, allProducts, reviewRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(products),
    db.select({ c: sql<number>`count(*)` }).from(reviews),
  ]);

  const totalRevenue = allOrders.reduce((s, o) => s + toNumber(o.total), 0);
  const paidRevenue = allOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + toNumber(o.total), 0);
  const newOrders = allOrders.filter((o) => o.status === "new").length;

  const lowStock = allProducts
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock }));

  // Orders still awaiting payment more than a day after creation, and not
  // yet cancelled — these likely need a manual follow-up or cancellation.
  const now = Date.now();
  const stalePendingOrders = allOrders
    .filter(
      (o) =>
        o.paymentStatus === "pending" &&
        o.status !== "cancelled" &&
        now - new Date(o.createdAt).getTime() > ONE_DAY_MS,
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const catMap = new Map<string, number>();
  for (const p of allProducts) {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1);
  }
  const topCategories = Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRevenue,
    paidRevenue,
    orderCount: allOrders.length,
    newOrders,
    productCount: allProducts.length,
    reviewCount: Number(reviewRows[0]?.c ?? 0),
    lowStock,
    topCategories,
    recentOrders: allOrders.slice(0, 6),
    stalePendingOrders,
  };
}