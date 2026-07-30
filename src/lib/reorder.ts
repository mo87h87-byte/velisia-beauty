import { db } from "@/db";
import { isAuthorized } from "@/lib/auth";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Shared body for admin "reorder by id list" PATCH endpoints — validates
 * auth and the `ids` payload, then hands each (id, sortOrder) pair to the
 * caller's table-specific update inside one transaction.
 */
export async function handleReorder(
  request: Request,
  updateSortOrder: (id: number, sortOrder: number, tx: DbTransaction) => Promise<unknown>,
): Promise<Response> {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const b = await request.json();
    const ids: number[] = Array.isArray(b.ids) ? b.ids.map(Number).filter(Boolean) : [];
    if (!ids.length) {
      return Response.json({ error: "قائمة المعرّفات مطلوبة" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await updateSortOrder(ids[i], i, tx);
      }
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
