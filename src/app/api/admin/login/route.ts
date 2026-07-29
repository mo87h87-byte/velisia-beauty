import { cookies } from "next/headers";
import {
  ADMIN_PASSWORD,
  ADMIN_TOKEN_MAX_AGE_MS,
  COOKIE_NAME,
  CSRF_COOKIE_NAME,
  createToken,
  createCsrfToken,
} from "@/lib/auth";
import { isRateLimited, recordLoginAttempt } from "@/lib/customer-auth";

const COOKIE_MAX_AGE_SECONDS = Math.floor(ADMIN_TOKEN_MAX_AGE_MS / 1000);

function clientKey(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `admin-login:${ip}`;
}

export async function POST(request: Request) {
  try {
    const key = clientKey(request);
    if (await isRateLimited(key)) {
      return Response.json(
        { error: "محاولات كثيرة جدًا، يرجى المحاولة بعد 15 دقيقة" },
        { status: 429 },
      );
    }

    const { password } = await request.json();
    if (typeof password !== "string" || password.trim() !== ADMIN_PASSWORD) {
      await recordLoginAttempt(key, false);
      return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const token = createToken();
    const csrfToken = createCsrfToken(token);

    // Best-effort cookies (works in first-party contexts). The token is also
    // returned in the body so the client can store it in localStorage and
    // authenticate via the Authorization header — this works reliably even
    // when third-party cookies are blocked (e.g. inside preview iframes).
    // sameSite "lax" (not "none") since the admin panel is only ever used
    // as a first-party top-level page — "none" bought cross-site cookie
    // delivery we don't need and that widened the CSRF surface.
    try {
      const store = await cookies();
      store.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SECONDS,
        secure: true,
      });
      // Not httpOnly — the CSRF cookie is meant to be paired with a
      // JS-attached header, never relied on by itself.
      store.set(CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SECONDS,
        secure: true,
      });
    } catch {
      /* ignore cookie failures */
    }

    return Response.json({ ok: true, token, csrfToken });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(CSRF_COOKIE_NAME);
  return Response.json({ ok: true });
}
