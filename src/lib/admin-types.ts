import type { Order, Message, Product } from "@/db/schema";

export interface DashboardStats {
  totalRevenue: number;
  paidRevenue: number;
  orderCount: number;
  newOrders: number;
  productCount: number;
  reviewCount: number;
  lowStock: { id: number; name: string; stock: number }[];
  topCategories: { category: string; count: number }[];
  recentOrders: Order[];
}

export interface AdminData {
  stats: DashboardStats;
  orders: Order[];
  products: Product[];
  messages: Message[];
}
