/**
 * Catch-all Route Handler that forwards browser requests to the internal
 * FastAPI service. Cookies stay first-party to the Next.js origin, so all
 * `Set-Cookie` headers issued by FastAPI are surfaced to the browser as
 * same-site cookies.
 *
 * Why a proxy:
 * - SameSite=Lax HttpOnly cookies work cleanly without CORS gymnastics.
 * - Server components, server actions, and the browser all use the same
 *   `/api/v1/*` URLs.
 * - The browser never learns the FastAPI origin (`INTERNAL_API_URL` is a
 *   server-only env var).
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "accept-encoding",
]);

function getBackendBase(): string {
  const internal = process.env.INTERNAL_API_URL;
  if (internal && internal.length > 0) return internal.replace(/\/$/, "");

  const isDev = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
  const fallback = isDev
    ? process.env.NEXT_PUBLIC_DEV_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!fallback) {
    throw new Error(
      "Missing INTERNAL_API_URL (or NEXT_PUBLIC_DEV_URL / NEXT_PUBLIC_BACKEND_URL fallback)",
    );
  }
  return fallback.replace(/\/$/, "");
}

function buildTargetUrl(req: NextRequest, pathSegments: string[]): string {
  const base = getBackendBase();
  const search = req.nextUrl.search ?? "";
  const path = ["api", ...pathSegments].join("/");
  return `${base}/${path}${search}`;
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    out.set(key, value);
  });
  // Preserve client IP for downstream observability.
  const fwd = req.headers.get("x-forwarded-for");
  if (!fwd) {
    const remote =
      req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip");
    if (remote) out.set("x-forwarded-for", remote);
  }
  return out;
}

async function forward(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await ctx.params;
  const targetUrl = buildTargetUrl(req, path);
  const headers = forwardRequestHeaders(req);

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  let body: BodyInit | undefined;
  if (hasBody) {
    // Stream the original body; this works for JSON and multipart alike.
    body = req.body ?? undefined;
  }

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  };
  if (hasBody) init.duplex = "half";

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch {
    return NextResponse.json(
      { success: false, message: "Upstream service unavailable" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return;
    responseHeaders.set(key, value);
  });

  // Preserve every Set-Cookie individually (Headers#append, not set).
  // Node 20+ exposes `getSetCookie` for proper multi-cookie handling.
  const setCookies =
    typeof (upstream.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (
          upstream.headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : (upstream.headers
          .get("set-cookie")
          ?.split(/,(?=[^;]+=[^;]+)/)
          .map((s) => s.trim()) ?? []);
  for (const cookie of setCookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function OPTIONS(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
export async function HEAD(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, ctx);
}
