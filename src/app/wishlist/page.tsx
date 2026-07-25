import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "قائمة المفضلة | velisiabeauty",
  description: "منتجاتك المفضلة في مكان واحد — راجعيها وأضيفيها لسلة التسوق في أي وقت.",
};

export default async function WishlistPage() {
  const allProducts = await getAllProducts();

  return <WishlistClient allProducts={allProducts} />;
}