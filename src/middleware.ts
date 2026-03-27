import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/publish",
  "/profile",
  "/api/admin",
  "/api/checkout",
  "/api/connect",
  "/api/reviews",
  "/api/happie",
  "/api/keys",
];

function buildCspHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://avatars.githubusercontent.com data:",
    "connect-src 'self' https://checkout.stripe.com https://api.stripe.com https://va.vercel-scripts.com",
    "frame-src https://checkout.stripe.com",
    "font-src 'self'",
  ].join("; ");
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Auth check for protected routes
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !req.auth?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signIn = new URL("/auth/signin", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Pass nonce to Next.js via request header so it can apply to inline scripts
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP with nonce (replaces unsafe-inline for scripts)
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));

  return response;
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
