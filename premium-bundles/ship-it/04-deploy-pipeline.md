---
name: ship-it-deploy
description: >-
  Production deployment pipeline for Next.js apps. Covers Vercel setup, environment
  management, branching strategy, preview deploys, custom domain, and monitoring.
  The final step before your app is live.
---

# Deploy Pipeline

Get your app live with a proper CI/CD pipeline. No manual deploys.

## Step 1: Vercel Setup

```bash
npm install -g vercel
vercel login
vercel link
```

Or connect via Vercel Dashboard → New Project → Import Git Repository.

**Framework preset:** Auto-detects Next.js. No config needed.

## Step 2: Environment Variables

In Vercel → Settings → Environment Variables, add ALL your env vars:

| Variable | Scopes | Notes |
|----------|--------|-------|
| DATABASE_URL | All | Same DB for all environments |
| AUTH_SECRET | All | Same secret is fine |
| AUTH_GITHUB_ID | Production only | Production OAuth app |
| AUTH_GITHUB_SECRET | Production only | Production OAuth app |
| AUTH_GITHUB_ID | Preview only | Dev OAuth app (different!) |
| AUTH_GITHUB_SECRET | Preview only | Dev OAuth app |
| STRIPE_SECRET_KEY | All | Use test keys until launch |
| STRIPE_PUBLISHABLE_KEY | All | Use test keys until launch |
| STRIPE_WEBHOOK_SECRET | Production only | Production webhook |
| AUTH_TRUST_HOST | All | Set to "true" |

**CRITICAL: Split auth credentials by environment.** Production and preview need different OAuth apps because callback URLs differ.

## Step 3: Branching Strategy

```
main     → Production (auto-deploy)
dev      → Preview (auto-deploy to preview URL)
feature/ → Preview (auto-deploy, delete after merge)
```

**Setup:**
1. Create `dev` branch: `git checkout -b dev && git push -u origin dev`
2. Add branch protection on `main`: Settings → Rules → Rulesets
   - Block force pushes
   - Block deletions
   - Require PR before merging

**Workflow:**
1. Work on `dev`
2. Push → Vercel builds preview
3. Test on preview URL
4. Create PR: `dev` → `main`
5. Merge → Production deploy

## Step 4: Custom Domain

1. Register domain (Namecheap, Cloudflare, etc.)
2. In Vercel → Settings → Domains → Add domain
3. Add DNS records as shown by Vercel:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (minutes to hours)
5. Vercel auto-provisions SSL certificate

## Step 5: OAuth Callback URLs

After domain is live, update your GitHub OAuth app:
- Production callback: `https://yourdomain.com/api/auth/callback/github`
- Dev callback: `http://localhost:3000/api/auth/callback/github`

## Step 6: Stripe Webhook

Create production webhook in Stripe Dashboard:
1. Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Copy signing secret → add to Vercel env vars as `STRIPE_WEBHOOK_SECRET` (Production only)

## Step 7: Build Verification

Ensure your `package.json` build script includes Prisma:
```json
"build": "prisma generate && next build"
```

This ensures the Prisma client is regenerated on every Vercel build.

## Step 8: Monitoring (Day 1)

Add Vercel Analytics (zero config):
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from "@vercel/analytics/next";
// In the body:
<Analytics />
```

Enable in Vercel → Settings → Analytics.

## Go-Live Checklist

- [ ] All env vars set in Vercel (check Production AND Preview scopes)
- [ ] Custom domain resolves with HTTPS
- [ ] OAuth callback URL points to production domain
- [ ] Stripe webhook endpoint created for production
- [ ] `prisma generate` in build script
- [ ] Branch protection on `main`
- [ ] Vercel Analytics enabled
- [ ] First production deploy successful
- [ ] Sign in works on production domain
- [ ] Test payment works with Stripe test card (4242 4242 4242 4242)
