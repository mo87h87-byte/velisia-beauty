import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleReorder } from "@/lib/reorder";

export async function PATCH(request: Request) {
  return handleReorder(request, async (id, sortOrder, tx) => {
    await tx.update(products).set({ sortOrder }).where(eq(products.id, id));
  });
}
