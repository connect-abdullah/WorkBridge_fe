import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NEXT_PUBLIC_LANDING_LOCK is set ONLY on Vercel (production) so the app
// is locked to the landing page in prod while local dev remains navigable.
// When the flag is "1": visits to (main) routes or /auth routes redirect to "/".
// When unset (local dev): standard auth-based routing applies.
const LANDING_LOCK = process.env.NEXT_PUBLIC_LANDING_LOCK === "1";

const PROTECTED = ["/dashboard", "/projects", "/payments", "/notifications", "/profile"];
const AUTH_ROUTES = ["/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth:token")?.value;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (LANDING_LOCK && (isProtected || isAuthRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
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
