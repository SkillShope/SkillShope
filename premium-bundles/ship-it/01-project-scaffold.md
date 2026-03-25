---
name: ship-it-scaffold
description: >-
  Guided project scaffold for production Next.js apps. Sets up the full stack
  in sequence: Next.js 16 + TypeScript, Prisma + Postgres, NextAuth, Stripe,
  Tailwind CSS. Opinionated defaults, zero boilerplate decisions. Use at the
  start of any new web project.
---

# Project Scaffold

Set up a production-ready Next.js app in one session. Every decision is made for you. Follow the steps in order.

## Step 1: Initialize

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
```

Verify: `npm run dev` loads at localhost:3000.

## Step 2: Database (Prisma + Postgres)

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

Set `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
```

Create the Prisma singleton at `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Add to `package.json` scripts:
```json
"db:push": "prisma db push",
"db:generate": "prisma generate",
"db:studio": "prisma studio",
"build": "prisma generate && next build"
```

## Step 3: Authentication (NextAuth)

```bash
npm install next-auth @auth/prisma-adapter
```

Generate auth secret:
```bash
openssl rand -base64 32
```

Add to `.env`:
```
AUTH_SECRET="your-generated-secret"
AUTH_GITHUB_ID="your-github-oauth-id"
AUTH_GITHUB_SECRET="your-github-oauth-secret"
```

Create `src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
```

Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

Add User, Account, Session, VerificationToken models to `prisma/schema.prisma` per the NextAuth Prisma adapter docs.

Run `npx prisma db push`.

## Step 4: Payments (Stripe)

```bash
npm install stripe
```

Add to `.env`:
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Create `src/lib/stripe.ts`:
```typescript
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

Create checkout route at `src/app/api/checkout/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Create Stripe Checkout session here
}
```

**CRITICAL: Never handle raw card data. Always use Stripe Checkout.**

## Step 5: Styling (Tailwind)

Already installed by create-next-app. Set up a theme in `src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --bg: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #161616;
  --border: #222222;
  --text: #ededed;
  --text-secondary: #888888;
  --accent: #your-brand-color;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

## Step 6: Environment & Git

Create `.env.example` with all required vars (no values):
```
DATABASE_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Verify `.gitignore` includes:
```
.env
.env.local
node_modules/
.next/
```

Initialize git:
```bash
git init
git add -A
git commit -m "Initial scaffold"
```

## Checkpoint

Before proceeding to the next skill (Database Design), verify:
- [ ] `npm run dev` works
- [ ] Prisma connects to your database
- [ ] Auth sign-in/sign-out works
- [ ] Stripe test checkout creates a session
- [ ] All env vars documented in `.env.example`
- [ ] `.env` is gitignored
