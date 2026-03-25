---
name: ship-it-security
description: >-
  Production security hardening for Next.js apps. Covers authentication flows,
  authorization middleware, input validation, rate limiting, CSRF protection,
  security headers, and common vulnerabilities. Builds on scaffold + database.
---

# Auth & Security Hardening

Lock down your app before it goes live. Every step has a specific vulnerability it prevents.

## Step 1: Auth-Gate Protected Routes

Create `src/lib/require-auth.ts`:
```typescript
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  // Check admin role in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") redirect("/");
  return session;
}
```

**Use in every protected page:**
```typescript
export default async function DashboardPage() {
  const session = await requireAuth();
  // ... page content
}
```

**Use in every protected API route:**
```typescript
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... route logic
}
```

## Step 2: Input Validation

Create `src/lib/validation.ts`:
```typescript
export function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export function isValidEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isValidSlug(str: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
}
```

**Rules:**
- Sanitize every user input before database storage
- Validate types server-side — never trust the client
- Truncate all strings to maximum lengths
- Parse numbers with fallbacks: `Number(val) || 0`

## Step 3: Rate Limiting

Create `src/lib/rate-limit.ts`:
```typescript
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  entry.count++;
  return { allowed: entry.count <= limit };
}
```

**Apply to every POST route:**
```typescript
const { allowed } = rateLimit(`action:${session.user.id}`, 10, 60_000);
if (!allowed) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

## Step 4: Security Headers

Add to `next.config.ts`:
```typescript
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

## Step 5: Origin Validation

**Never trust the `origin` header for redirects:**
```typescript
const ALLOWED_ORIGINS = [
  "https://yourapp.com",
  "http://localhost:3000",
];

export function getSafeOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return "https://yourapp.com";
}
```

Use everywhere you construct redirect URLs (Stripe callbacks, OAuth returns, etc.).

## Step 6: Webhook Verification

For Stripe webhooks, **always verify the signature:**
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

Never process unverified webhooks. A missing or invalid signature = reject immediately.

## Step 7: Authorization Checks

Every mutation must verify ownership:
```typescript
// WRONG: Anyone can delete any post
await prisma.post.delete({ where: { id } });

// RIGHT: Only the author can delete their post
const post = await prisma.post.findUnique({ where: { id } });
if (post?.authorId !== session.user.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
await prisma.post.delete({ where: { id } });
```

## Security Checklist

Before deploying, verify ALL of these:
- [ ] No secrets in code (all in env vars)
- [ ] `.env` is in `.gitignore`
- [ ] All POST routes have auth checks
- [ ] All POST routes have rate limiting
- [ ] All user input is sanitized
- [ ] All redirects use origin validation
- [ ] Webhooks verify signatures
- [ ] Mutations check resource ownership
- [ ] Security headers are set
- [ ] HTTPS is enforced (Vercel does this automatically)
