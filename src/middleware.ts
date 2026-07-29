import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyCsrfToken, verifyToken } from "@/lib/auth";

// Needs Node's `crypto` (via @/lib/auth) for the HMAC checks below, which
// isn't available in the default Edge middleware runtime.
export const runtime = "nodejs";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Per-IP request caps for public POST endpoints that have no login to
// throttle. In-memory (not DB-backed): resets on cold start and is tracked
// per serverless instance rather than globally, so it's a best-effort
// deterrent against casual scripted abuse, not an exact global limit.
// /api/chat and /api/track get a tighter cap — chat burns a real Anthropic
// API call per message, and track looks up orders by number with no other
// auth, so both are worth throttling harder than a plain form POST.
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/chat": { limit: 8, windowMs: 60_000 },
  "/api/track": { limit: 8, windowMs: 60_000 },
  "/api/orders": { limit: 15, windowMs: 60_000 },
  "/api/reviews": { limit: 15, windowMs: 60_000 },
  "/api/testimonials": { limit: 15, windowMs: 60_000 },
  "/api/contact": { limit: 15, windowMs: 60_000 },
};

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function clientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isOverLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Occasional sweep so the map doesn't grow unbounded with one-off IPs.
  if (now - lastSweep > windowMs * 5) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(k);
    }
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count++;
  return bucket.count > limit;
}

function tooManyRequests(windowMs: number) {
  return NextResponse.json(
    { error: "طلبات كثيرة جدًا، يرجى المحاولة بعد قليل" },
    { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } },
  );
}

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
  const path = request.nextUrl.pathname;

  const rateLimit = RATE_LIMITS[path];
  if (rateLimit && request.method === "POST") {
    const key = `${path}:${clientIp(request)}`;
    if (isOverLimit(key, rateLimit.limit, rateLimit.windowMs)) {
      return tooManyRequests(rateLimit.windowMs);
    }
  }

  if (!path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

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
  matcher: [
    "/api/admin/:path*",
    "/api/chat",
    "/api/track",
    "/api/orders",
    "/api/reviews",
    "/api/testimonials",
    "/api/contact",
  ],
};
