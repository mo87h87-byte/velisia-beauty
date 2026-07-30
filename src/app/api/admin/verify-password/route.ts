import { isAuthorized } from "@/lib/auth";
import { verifyAdminPassword } from "@/lib/admin-password";
import { isRateLimited, recordLoginAttempt } from "@/lib/customer-auth";

function clientKey(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `admin-verify-password:${ip}`;
}

/**
 * Step-up re-authentication check for sensitive admin UI (e.g. revealing the
 * change-password form) — confirms the caller still knows the current
 * password without changing anything. Same rate-limit mechanism as login,
 * since a valid session token alone shouldn't let someone brute-force the
 * password through this endpoint.
 */
export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const key = clientKey(request);
    if (await isRateLimited(key)) {
      return Response.json(
        { error: "محاولات كثيرة جدًا، يرجى المحاولة بعد 15 دقيقة" },
        { status: 429 },
      );
    }

    const { password } = await request.json();
    if (typeof password !== "string" || !(await verifyAdminPassword(password))) {
      await recordLoginAttempt(key, false);
      return Response.json({ error: "كلمة السر غير صحيحة" }, { status: 401 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
