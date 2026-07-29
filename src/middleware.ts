import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyCsrfToken, verifyToken } from "@/lib/auth";

// Needs Node's `crypto` (via @/lib/auth) for the HMAC checks below, which
// isn't available in the default Edge middleware runtime.
export const runtime = "nodejs";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // No Origin header (some same-site requests omit it) — fall back to
  // Referer. If neither is present, fail closed rather than assume trust.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return false;
}

function extractSessionToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (bearerToken && verifyToken(bearerToken)) return bearerToken;

  const cookieToken = request.cookies.get(COOKIE_NAME)?.value ?? null;
  if (cookieToken && verifyToken(cookieToken)) return cookieToken;

  return null;
}

function deny() {
  return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
}

export function middleware(request: NextRequest) {
  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  if (!isSameOrigin(request)) {
    return deny();
  }

  // Login establishes the session itself — there's no CSRF token to check
  // yet, but the same-origin check above still applies to it.
  if (request.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = extractSessionToken(request);
  // No valid session at all — let the route handler's own isAuthorized()
  // reject it with the normal 401 instead of masking it as a 403 here.
  if (!sessionToken) {
    return NextResponse.next();
  }

  const csrfHeader = request.headers.get("x-csrf-token");
  if (!verifyCsrfToken(sessionToken, csrfHeader)) {
    return deny();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
