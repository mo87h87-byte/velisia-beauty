import { isAuthorized } from "@/lib/auth";
import { verifyAdminPassword, hashPassword, setStoredPasswordHash } from "@/lib/admin-password";

const MIN_LENGTH = 8;

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return Response.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }
    if (newPassword.length < MIN_LENGTH) {
      return Response.json(
        { error: `كلمة السر الجديدة لازم تكون ${MIN_LENGTH} أحرف على الأقل` },
        { status: 400 },
      );
    }
    if (!(await verifyAdminPassword(currentPassword))) {
      return Response.json({ error: "كلمة السر الحالية غير صحيحة" }, { status: 401 });
    }

    const hash = await hashPassword(newPassword);
    await setStoredPasswordHash(hash);

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
