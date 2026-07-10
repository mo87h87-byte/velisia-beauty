import { cookies } from "next/headers";
import { ADMIN_PASSWORD, COOKIE_NAME, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (typeof password !== "string" || password.trim() !== ADMIN_PASSWORD) {
      return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const token = createToken();

    // Best-effort cookie (works in first-party contexts). The token is also
    // returned in the body so the client can store it in localStorage and
    // authenticate via the Authorization header — this works reliably even
    // when third-party cookies are blocked (e.g. inside preview iframes).
    try {
      const store = await cookies();
      store.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
      });
    } catch {
      /* ignore cookie failures */
    }

    return Response.json({ ok: true, token });
  } catch {
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  return Response.json({ ok: true });
}
