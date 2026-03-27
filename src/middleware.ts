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

// Routes that require admin access (checked in handlers, but blocked early here)
const ADMIN_ROUTES = ["/api/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  if (!req.auth?.user) {
    // API routes get 401, pages get redirected to sign-in
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signIn = new URL("/auth/signin", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
