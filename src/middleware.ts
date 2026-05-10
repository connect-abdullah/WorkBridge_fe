import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-runtime middleware that does *presence-only* cookie checks. The
 * authoritative authorization happens in (main)/layout.tsx via
 * `requireSession()` (which actually resolves the user against FastAPI) and
 * inside FastAPI itself. Decoding/verifying the JWT here would slow Edge
 * routing for no real security gain — a stolen `access_token` cookie would
 * still get rejected at the API layer.
 *
 * Rules:
 * - Authenticated visitors hitting `/auth/*` are bounced to `/dashboard`.
 * - Unauthenticated visitors hitting protected routes are bounced to
 *   `/auth/login?next=<original-path>`.
 *
 * "Authenticated" here means *either* an `access_token` cookie *or* a
 * `refresh_token` cookie is present — the access token may have just
 * expired but the user can still refresh.
 */

const PROTECTED = [
  "/dashboard",
  "/projects",
  "/payments",
  "/notifications",
  "/profile",
];

const AUTH_ROUTES = ["/auth"];

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

function hasSomeAuthCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value ??
    req.cookies.get(REFRESH_COOKIE)?.value,
  );
}

/**
 * Pre-launch “landing lock”: block both `/auth/*` and all protected app routes so
 * visitors stay on the marketing site. Re-enable by uncommenting the call in
 * `middleware()` below.
 *
 * Does not delete or replace normal auth middleware — when disabled, login and
 * dashboard behave as usual.
 */
// Unused while landing lock is off; uncomment the call in `middleware()` to reactivate.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- preserved pre-launch guard
function landingLockRedirect(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected && !isAuthRoute) return null;

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  // Landing lock (pre-launch) — disabled; uncomment to send `/auth/*` + protected routes to `/`.
  // const landingLocked = landingLockRedirect(req);
  // if (landingLocked) return landingLocked;

  const { pathname, search } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected && !isAuthRoute) return NextResponse.next();

  const authed = hasSomeAuthCookie(req);

  if (isAuthRoute && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    const next = `${pathname}${search ?? ""}`;
    url.search = `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth",
    "/auth/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/projects",
    "/projects/:path*",
    "/payments",
    "/payments/:path*",
    "/notifications",
    "/notifications/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
