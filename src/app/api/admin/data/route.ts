import { isAuthorized } from "@/lib/auth";
import { getAllOrders, getAllMessages, getDashboardStats } from "@/lib/admin";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

/**
 * Single authorized endpoint returning all admin data the panel needs.
 * Authorized via the Authorization: Bearer <token> header.
 */
export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const [stats, orders, products, messages] = await Promise.all([
    getDashboardStats(),
    getAllOrders(),
    getAllProducts(),
    getAllMessages(),
  ]);
  return Response.json({ stats, orders, products, messages });
}
