# RoughInHub Pivot — Plan 3: Buyer Experience & Seeding

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the buyer loop — full blueprint detail page with purchase button, My Library with downloads, secure file delivery via Vercel Blob URLs, and seed 10 starter blueprints.

**Architecture:** Rewrite the blueprint detail page as a rich product page with author info, file list, and a prominent buy/download CTA. Rewrite the dashboard as "My Library" showing purchased blueprints with download buttons. Update the delivery API to return actual Vercel Blob file URLs. Create a seed script with the 10 provided plumbing blueprints (first 4 featured).

**Tech Stack:** Next.js 16 App Router, Prisma 6, Stripe (existing checkout + webhook), Vercel Blob, Vitest

**Branch:** `pivot/roughinhub`
**Database:** Dev branch only (`ep-hidden-mouse-anamh99d`). NEVER push to prod.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Rewrite | `src/app/blueprints/[slug]/page.tsx` | Full blueprint detail page with buy button |
| Create | `src/components/buy-button.tsx` | Client-side purchase button (triggers Stripe checkout) |
| Rewrite | `src/app/dashboard/page.tsx` | My Library — purchased blueprints + downloads |
| Modify | `src/app/api/deliver/[blueprintId]/route.ts` | Return actual Blob file URLs |
| Create | `prisma/seed.ts` | Seed 10 plumbing blueprints |

---

### Task 1: Blueprint Detail Page

**Files:**
- Rewrite: `src/app/blueprints/[slug]/page.tsx`
- Create: `src/components/buy-button.tsx`

- [ ] **Step 1: Create the BuyButton client component**

Create `src/components/buy-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Loader2, ShoppingCart, Download, Check } from "lucide-react";

type BuyButtonProps = {
  blueprintId: string;
  blueprintSlug: string;
  isFree: boolean;
  price: number;
  owned: boolean;
};

export function BuyButton({ blueprintId, blueprintSlug, isFree, price, owned }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  if (owned) {
    return (
      <a
        href={`/api/deliver/${blueprintId}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)]/15 py-4 text-base font-semibold text-[var(--green)]"
      >
        <Check className="h-5 w-5" />
        {isFree ? "Download Free Blueprint" : "Download — Purchased"}
      </a>
    );
  }

  if (isFree) {
    return (
      <a
        href={`/api/deliver/${blueprintId}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        <Download className="h-5 w-5" />
        Download Free Blueprint
      </a>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprintId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Redirecting to checkout...
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Buy for ${price.toFixed(2)} — Instant Access
        </>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Rewrite the blueprint detail page**

Replace `src/app/blueprints/[slug]/page.tsx` entirely. This is a server component.

The page should:

1. Fetch the blueprint with author and files:
```typescript
const blueprint = await prisma.blueprint.findUnique({
  where: { slug },
  include: {
    author: { select: { id: true, name: true, image: true, showAvatar: true } },
    files: { select: { id: true, filename: true, size: true, mimeType: true } },
  },
});
```

2. Check ownership (server-side):
```typescript
let owned = blueprint.isFree;
if (!owned && session?.user?.id) {
  const purchase = await prisma.purchase.findUnique({
    where: { userId_blueprintId: { userId: session.user.id, blueprintId: blueprint.id } },
  });
  owned = !!purchase;
}
```

3. Layout as a two-column page (content left, purchase card right):

**Left column:**
- Back to Browse link
- Blueprint name (h1)
- Description
- Category badge + region badge + file type badge
- Tags
- "About" section with longDescription
- Files included list (filename + size, no download links — those are in the purchase card)

**Right column (sticky sidebar):**
- Price display (big, bold — "Free" in green or "$XX.XX" in orange)
- `<BuyButton>` component with owned/isFree/price props
- If signed out and paid: "Sign in to Purchase" link
- Author card (name, avatar)
- "Files included" count
- License note: "Buy once. Access forever. Non-transferable."

4. Import `BuyButton` from `@/components/buy-button`
5. Import icons from lucide-react: `ArrowLeft, FileText, MapPin, User, Download, Tag, Clock`
6. Import `auth` from `@/lib/auth`

Use the category/type label maps from the BlueprintCard pattern. Make the page mobile-first — on small screens, the sidebar stacks below the main content.

- [ ] **Step 3: Verify it renders**

```bash
npm run dev
```

Navigate to `/blueprints/some-slug` — should show the full detail page (will be empty until seeded).

- [ ] **Step 4: Commit**

```bash
git add src/components/buy-button.tsx src/app/blueprints/\\[slug\\]/page.tsx
git commit -m "feat: blueprint detail page with buy button and file list"
```

---

### Task 2: My Library (Dashboard Rewrite)

**Files:**
- Rewrite: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Rewrite the dashboard as My Library**

Replace `src/app/dashboard/page.tsx`. This is a server component.

The page should:

1. Require auth (redirect to sign-in if not logged in)

2. Fetch two sets of data:

**Purchased blueprints:**
```typescript
const purchases = await prisma.purchase.findMany({
  where: { userId: session.user.id },
  include: {
    blueprint: {
      include: {
        files: { select: { id: true, filename: true, size: true, mimeType: true } },
      },
    },
    downloadToken: true,
  },
  orderBy: { createdAt: "desc" },
});
```

**Creator's blueprints (if they've published any):**
```typescript
const myBlueprints = await prisma.blueprint.findMany({
  where: { authorId: session.user.id },
  include: { files: { select: { id: true } } },
  orderBy: { createdAt: "desc" },
});
```

3. Display two sections:

**"My Purchased Blueprints" section:**
- List of purchased blueprints as cards
- Each card shows: blueprint name, purchase date, file count
- Prominent "Download" button per blueprint that links to `/api/deliver/{blueprintId}` (the delivery endpoint will handle access)
- If no purchases: "No blueprints purchased yet. Browse blueprints to find what you need."

**"My Published Blueprints" section (only if user has published):**
- List of blueprints the user created
- Each shows: name, price, download count, file count, created date
- Link to edit page (stub for now — just link to the detail page)
- "Sell a Blueprint" button linking to `/publish`

4. Use Lucide icons: `Download, FileText, Package, Plus, Calendar`

- [ ] **Step 2: Verify it renders**

```bash
npm run dev
```

Navigate to `/dashboard` while signed in — should show "My Library" with both sections (empty until purchases/blueprints exist).

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: My Library page — purchased and published blueprints"
```

---

### Task 3: File Delivery API

**Files:**
- Modify: `src/app/api/deliver/[blueprintId]/route.ts`

- [ ] **Step 1: Update the delivery route to return file URLs**

Replace the stub response at the end of `src/app/api/deliver/[blueprintId]/route.ts`. After the authorization check passes, fetch the blueprint's files and return their Blob URLs:

Replace the last section (the stub lines starting with `// File delivery rewrite coming in Plan 3`) with:

```typescript
  // Fetch files for this blueprint
  const files = await prisma.blueprintFile.findMany({
    where: { blueprintId },
    select: { id: true, filename: true, blobUrl: true, size: true, mimeType: true },
  });

  if (files.length === 0) {
    return NextResponse.json({ error: "No files available for this blueprint" }, { status: 404 });
  }

  // Increment download counter (non-blocking)
  prisma.blueprint.update({
    where: { id: blueprintId },
    data: { downloads: { increment: 1 } },
  }).catch(() => {});

  auditInfo("deliver.success", { blueprintId, metadata: { fileCount: files.length } });

  // If single file, redirect directly to the Blob URL for immediate download
  if (files.length === 1) {
    return NextResponse.redirect(files[0].blobUrl);
  }

  // Multiple files — return the list with download URLs
  return NextResponse.json({
    blueprintId,
    files: files.map((f) => ({
      id: f.id,
      filename: f.filename,
      url: f.blobUrl,
      size: f.size,
      mimeType: f.mimeType,
    })),
  });
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/deliver/\\[blueprintId\\]/route.ts
git commit -m "feat: file delivery API — returns Vercel Blob URLs"
```

---

### Task 4: Seed 10 Starter Blueprints

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write the seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create or find admin user for seeding
  const admin = await prisma.user.upsert({
    where: { email: "admin@roughinhub.com" },
    update: {},
    create: {
      email: "admin@roughinhub.com",
      name: "RoughInHub",
      isAdmin: true,
    },
  });

  const blueprints = [
    {
      slug: "virginia-residential-bid-calculator-2026",
      name: "2026 Virginia Residential Bid Calculator with Local Material Costs",
      description: "Fully customizable Excel spreadsheet with current Virginia material & labor rates baked in. Automatically calculates job totals, markup, permits, and profit margin. Saves 3+ hours per bid and reduces underbidding mistakes. Includes tabs for service calls, bathroom remodels, and whole-house repipes. Updated for 2026 code changes.",
      longDescription: "This bid calculator is built by a Virginia plumber with 15+ years of experience bidding residential jobs. It includes current 2026 material costs from local suppliers, labor rate benchmarks for the Mid-Atlantic region, automatic markup and profit margin calculations, and separate tabs for different job types.\n\nIncludes: Service call estimates, bathroom remodel bids, whole-house repipe calculations, permit cost tables, and a profit margin analyzer. All formulas are unlocked so you can customize for your business.",
      category: "estimating-bidding",
      type: "excel",
      price: 29.0,
      isFree: false,
      region: "Virginia (and Mid-Atlantic)",
      tags: "bid calculator,residential,virginia,estimating,material costs",
      featured: true,
    },
    {
      slug: "plumbing-service-checklist-pack",
      name: "Professional Plumbing Service & Repair Checklist Pack (Digital + Printable)",
      description: "12 ready-to-use checklists covering water heater service, faucet repair, drain cleaning, leak detection, and toilet rebuilds. Includes pass/fail fields and customer sign-off sections. Prevents missed steps and protects you from \"you didn't fix it\" callbacks.",
      longDescription: "Stop relying on memory. These 12 professional checklists ensure you never miss a step on common plumbing service calls. Each checklist includes numbered steps, pass/fail checkboxes, notes fields, and a customer sign-off section for liability protection.\n\nCovers: Water heater service (tank + tankless), faucet repair, drain cleaning, leak detection, toilet rebuilds, garbage disposal install, sump pump service, and more. Print them out or use on a tablet.",
      category: "service-repair",
      type: "pdf",
      price: 19.0,
      isFree: false,
      region: "Nationwide",
      tags: "checklists,service,repair,water heater,drain cleaning",
      featured: true,
    },
    {
      slug: "plumbing-proposal-bundle",
      name: "Scope-of-Work Plumbing Proposal Template Bundle",
      description: "Editable proposal templates (Word + PDF) with professional formatting, scope-of-work breakdowns, material lists, timelines, and payment schedules. Includes change-order addendum to prevent scope creep. Used by plumbers who win 80%+ of the jobs they bid.",
      longDescription: "Win more jobs with professional proposals that clearly communicate scope, timeline, and pricing. This bundle includes 5 proposal templates covering different job types, each with detailed scope-of-work breakdowns, material lists, labor timelines, and payment schedules.\n\nAlso includes a change-order addendum template — the single most important document for preventing scope creep and protecting your profit margin. All templates are editable in Word.",
      category: "proposals-contracts",
      type: "zip-pack",
      price: 24.0,
      isFree: false,
      region: "Nationwide",
      tags: "proposals,contracts,scope of work,bidding,templates",
      featured: true,
    },
    {
      slug: "plumbing-service-agreement-pack",
      name: "Iron-Clad Residential Plumbing Service Agreement & Contract Pack",
      description: "Legally strong service agreement templates with clear warranty language, liability protection, emergency rates, and termination clauses. Reduces disputes and protects your business from common client claims. Includes both short service-call and full-project versions.",
      longDescription: "Protect your business with service agreements that have been battle-tested across hundreds of residential plumbing jobs. These templates include clear warranty language, liability limitations, emergency rate provisions, and termination clauses.\n\nIncludes: Short-form service call agreement, full-project service contract, warranty policy template, and emergency service addendum. All are editable and customizable per state.",
      category: "proposals-contracts",
      type: "pdf",
      price: 22.0,
      isFree: false,
      region: "Nationwide (customizable per state)",
      tags: "contracts,service agreement,legal,warranty,liability",
      featured: true,
    },
    {
      slug: "apprentice-training-kit-week1-4",
      name: "Apprentice Training Starter Kit – Week 1-4 Curriculum",
      description: "Complete beginner apprentice training materials: safety checklists, tool lists, basic copper sweating guide, drain/vent diagrams, quiz bank, and daily task sheets. Helps you train new hires faster and reduce costly mistakes on the job.",
      longDescription: "Training a new apprentice from scratch is expensive — every mistake costs you time and materials. This starter kit gives you a structured 4-week curriculum that covers all the basics: safety protocols, tool identification and care, basic copper sweating, drain and vent system diagrams, and daily task tracking.\n\nIncludes quizzes for each week to verify comprehension, daily task sheets for accountability, and a safety checklist that must be signed before any jobsite work.",
      category: "training",
      type: "zip-pack",
      price: 39.0,
      isFree: false,
      region: "Nationwide",
      tags: "apprentice,training,curriculum,safety,new hire",
      featured: false,
    },
    {
      slug: "insurance-claim-documentation-pack",
      name: "Insurance Claim Roofing & Plumbing Documentation Pack",
      description: "Photo logging template, before/after report format, and claim submission checklist that insurance companies actually accept. Includes language that maximizes approval rates for water damage and pipe burst claims.",
      longDescription: "Insurance claims for water damage and pipe bursts get denied all the time because of poor documentation. This pack gives you the exact templates and language that insurance adjusters expect to see.\n\nIncludes: Photo logging template with required angles and metadata, before/after damage report format, itemized repair estimate template, and a claim submission checklist. The language in these templates has been refined through dozens of successful claims.",
      category: "safety-compliance",
      type: "pdf",
      price: 27.0,
      isFree: false,
      region: "Nationwide",
      tags: "insurance,claims,documentation,water damage,compliance",
      featured: false,
    },
    {
      slug: "bathroom-rough-in-combo",
      name: "Bathroom Rough-In Bid & Checklist Combo",
      description: "Specialized bid calculator + installation checklist for bathroom rough-ins. Includes fixture counts, pipe sizing guide, and common code compliance items. Perfect for new construction or remodel bids.",
      longDescription: "Bathroom rough-ins are one of the most common plumbing jobs — and one of the easiest to underbid. This combo pack includes a specialized bid calculator for bathroom rough-ins and a step-by-step installation checklist.\n\nThe bid calculator accounts for fixture counts, pipe sizing, fitting quantities, and labor hours. The checklist covers code compliance items that inspectors commonly flag. Works for both new construction and remodel rough-ins.",
      category: "estimating-bidding",
      type: "zip-pack",
      price: 18.0,
      isFree: false,
      region: "Nationwide",
      tags: "bathroom,rough-in,bid calculator,checklist,new construction",
      featured: false,
    },
    {
      slug: "drain-cleaning-pricing-checklist",
      name: "Drain Cleaning & Snaking Service Pricing & Checklist",
      description: "Pricing matrix + job checklist for drain/snaking jobs. Helps you quote accurately by length, difficulty, and camera inspection add-ons while tracking time and materials.",
      longDescription: "Stop guessing on drain cleaning prices. This pricing matrix gives you a structured approach to quoting drain cleaning and snaking jobs based on drain length, difficulty level, and add-on services like camera inspections.\n\nThe job checklist tracks time, materials used, and findings for each job — useful for both billing accuracy and follow-up sales opportunities.",
      category: "service-repair",
      type: "excel",
      price: 15.0,
      isFree: false,
      region: "Nationwide",
      tags: "drain cleaning,snaking,pricing,service,checklist",
      featured: false,
    },
    {
      slug: "water-heater-proposal-guide",
      name: "Water Heater Replacement Proposal & Installation Guide",
      description: "Professional proposal template + step-by-step installation & removal checklist for tank and tankless water heaters. Includes efficiency upgrade upsell language and warranty transfer sections.",
      longDescription: "Water heater replacements are high-margin jobs when you present them professionally. This pack includes a polished proposal template that clearly presents options (standard vs. high-efficiency, tank vs. tankless) and an installation checklist that ensures nothing gets missed.\n\nThe proposal includes efficiency upgrade upsell language that helps customers choose higher-margin options, and warranty transfer sections that protect both you and the customer.",
      category: "proposals-contracts",
      type: "pdf",
      price: 21.0,
      isFree: false,
      region: "Nationwide",
      tags: "water heater,proposals,installation,tankless,upsell",
      featured: false,
    },
    {
      slug: "plumber-marketing-kit",
      name: "Marketing & Client Acquisition Kit for Solo Plumbers",
      description: "Ready-to-use Google review request scripts, before/after photo templates, Facebook/Nextdoor post examples, and referral discount flyers. Helps solo plumbers get more calls without expensive ads.",
      longDescription: "Most solo plumbers don't market because they don't know where to start. This kit gives you everything you need to get more calls without spending money on ads.\n\nIncludes: Google review request scripts (text and email), before/after photo templates for social media, 10 ready-to-post Facebook and Nextdoor examples, referral discount flyer templates, and a simple tracking sheet to see what's working. All designed for plumbers who are great at their trade but hate marketing.",
      category: "marketing",
      type: "zip-pack",
      price: 25.0,
      isFree: false,
      region: "Nationwide",
      tags: "marketing,reviews,social media,referrals,solo plumber",
      featured: false,
    },
  ];

  for (const bp of blueprints) {
    await prisma.blueprint.upsert({
      where: { slug: bp.slug },
      update: bp,
      create: {
        ...bp,
        authorId: admin.id,
        hidden: false,
      },
    });
  }

  console.log(`\n✅ 10 starter blueprints seeded successfully. Ready for manual file uploads by the admin.\n`);
  console.log(`Featured blueprints (first 4):`);
  blueprints.filter((b) => b.featured).forEach((b) => console.log(`  ⭐ ${b.name} — $${b.price.toFixed(2)}`));
  console.log(`\nAll blueprints set to published (hidden: false).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run the seed script against the dev database**

CRITICAL: Use the dev branch DATABASE_URL:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_VAj9DXBFqpn6@ep-hidden-mouse-anamh99d-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" npx tsx prisma/seed.ts
```

Expected output:
```
✅ 10 starter blueprints seeded successfully. Ready for manual file uploads by the admin.

Featured blueprints (first 4):
  ⭐ 2026 Virginia Residential Bid Calculator with Local Material Costs — $29.00
  ⭐ Professional Plumbing Service & Repair Checklist Pack (Digital + Printable) — $19.00
  ⭐ Scope-of-Work Plumbing Proposal Template Bundle — $24.00
  ⭐ Iron-Clad Residential Plumbing Service Agreement & Contract Pack — $22.00

All blueprints set to published (hidden: false).
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed 10 starter plumbing blueprints — first 4 featured"
```

---

### Task 5: Build Verification and Smoke Test

**Files:** None — verification only

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server and verify the full buyer flow:

1. **Homepage** (`/`) — should show 4 featured blueprints in the grid
2. **Browse** (`/browse`) — should show all 10 blueprints with category filters working
3. **Detail page** (`/blueprints/virginia-residential-bid-calculator-2026`) — should show full detail with price, description, author, and "Buy for $29.00" button
4. **My Library** (`/dashboard`) — should show empty state ("No blueprints purchased yet")
5. **Publish** (`/publish`) — should show the two-step form

Checkout flow won't work fully without Stripe test keys configured, but the UI should render correctly.

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```

---

## Summary

After completing all 5 tasks:
- Full blueprint detail page with author info, file list, category/region badges, and buy button
- BuyButton component handling free downloads, paid checkout (Stripe), and owned state
- My Library page showing purchased blueprints with download buttons + published blueprints for creators
- File delivery API returning actual Vercel Blob URLs (single file: redirect, multiple: URL list)
- 10 seeded plumbing blueprints (first 4 featured, all published) covering all 8 categories

**The complete RoughInHub MVP is now functional:**
- Creators can publish blueprints with file uploads (Plan 2)
- Buyers can browse, purchase (Stripe), and download (Plan 3)
- 10 starter blueprints seeded for launch
- All safety limits in place (file size, storage caps, rate limiting)
- Mobile-first UI with plumbing-trade branding
