import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleReorder } from "@/lib/reorder";

export async function PATCH(request: Request) {
  return handleReorder(request, async (id, sortOrder, tx) => {
    await tx.update(testimonials).set({ sortOrder }).where(eq(testimonials.id, id));
  });
}
