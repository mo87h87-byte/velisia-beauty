import { getAllProducts } from "@/lib/products";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
  const allProducts = await getAllProducts();

  return <WishlistClient allProducts={allProducts} />;
}