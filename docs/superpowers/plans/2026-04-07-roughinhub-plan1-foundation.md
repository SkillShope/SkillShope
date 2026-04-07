# RoughInHub Pivot — Plan 1: Foundation (Schema + Branding + Cleanup)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Skill Shope into RoughInHub — a plumbing blueprint marketplace — by overhauling the database schema, branding, color palette, homepage, and removing all AI-specific features.

**Architecture:** Create a new Neon database branch for isolated development. Rewrite the Prisma schema replacing `Skill` with `Blueprint` and dropping AI-specific tables. Update the entire visual identity (colors, fonts, copy) to target plumbing contractors. Gut all AI/MCP/CLI features and replace with plumbing-specific language. This plan produces a buildable, runnable app with the new brand — publishing and buyer flows come in Plans 2 and 3.

**Tech Stack:** Next.js 16, Prisma 6, PostgreSQL (Neon), Tailwind CSS 4, Stripe (unchanged), NextAuth v5 (unchanged)

**Branch:** `pivot/roughinhub`
**Database:** Dev branch only (`br-blue-fire-an2213hz` on Neon project `wandering-breeze-69708494`). NEVER push to main/prod.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | New schema: Blueprint, BlueprintFile, drop AI tables |
| Modify | `src/app/globals.css` | New color palette (navy + orange) |
| Modify | `src/app/layout.tsx` | New metadata, title, fonts |
| Modify | `src/components/navbar.tsx` | RoughInHub branding, simplified nav |
| Rewrite | `src/app/page.tsx` | New homepage hero + plumbing categories |
| Modify | `src/lib/constants.ts` | New constants (file limits, plumbing categories) |
| Modify | `src/app/browse/page.tsx` | Plumbing categories, remove AI filters |
| Rewrite | `src/components/skill-card.tsx` → `src/components/blueprint-card.tsx` | New card for blueprints |
| Delete | `src/lib/tokenize.ts` | AI token counting (no longer needed) |
| Delete | `src/lib/format-tokens.ts` | Token formatting (no longer needed) |
| Delete | `src/lib/security/` | AI security scanning pipeline |
| Delete | `src/app/api/happie/` | AI chatbot |
| Delete | `src/app/api/github-import/` | GitHub auto-import |
| Delete | `src/app/api/github-verify/` | GitHub ownership verification |
| Delete | `src/components/happie.tsx` | AI chatbot widget |
| Delete | `tests/lib/tokenize.test.ts` | Removed feature tests |
| Delete | `tests/lib/format-tokens.test.ts` | Removed feature tests |
| Delete | `tests/api/skills-tokenize.test.ts` | Removed feature tests |
| Modify | `public/manifest.json` | RoughInHub name + colors |

---

### Task 1: Create New Neon Branch and Rewrite Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

This is the foundation everything else depends on. We wipe all data and create a clean schema for RoughInHub.

- [ ] **Step 1: Rewrite the Prisma schema**

Replace the entire contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String?   @unique
  emailVerified         DateTime?
  image                 String?
  bio                   String?
  showAvatar            Boolean   @default(true)
  isAdmin               Boolean   @default(false)
  stripeAccountId       String?
  stripePayoutsEnabled  Boolean   @default(false)
  accounts              Account[]
  sessions              Session[]
  blueprints            Blueprint[]
  purchases             Purchase[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Blueprint {
  id              String          @id @default(cuid())
  slug            String          @unique
  name            String
  description     String
  longDescription String?
  category        String          // estimating-bidding | service-repair | proposals-contracts | training | marketing | safety-compliance | residential | commercial
  type            String          @default("pdf") // pdf | excel | zip-pack | video | doc
  price           Float           @default(0)
  isFree          Boolean         @default(true)
  region          String?         // e.g., "Virginia", "Nationwide"
  downloads       Int             @default(0)
  featured        Boolean         @default(false)
  hidden          Boolean         @default(false)
  tags            String?         // comma-separated
  authorId        String
  author          User            @relation(fields: [authorId], references: [id], onDelete: Cascade)
  purchases       Purchase[]
  files           BlueprintFile[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model BlueprintFile {
  id          String    @id @default(cuid())
  blueprintId String
  blueprint   Blueprint @relation(fields: [blueprintId], references: [id], onDelete: Cascade)
  filename    String
  blobUrl     String    // Vercel Blob URL
  size        Int       // bytes
  mimeType    String
  createdAt   DateTime  @default(now())

  @@index([blueprintId])
}

model Purchase {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  blueprintId     String
  blueprint       Blueprint     @relation(fields: [blueprintId], references: [id], onDelete: Cascade)
  stripeSessionId String        @unique
  amount          Float
  createdAt       DateTime      @default(now())
  downloadToken   DownloadToken?

  @@unique([userId, blueprintId])
}

model DownloadToken {
  id         String    @id @default(cuid())
  token      String    @unique
  purchaseId String    @unique
  purchase   Purchase  @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  type        String   // checkout.started | checkout.completed | checkout.failed | webhook.received | webhook.failed | deliver.success | deliver.denied
  severity    String   @default("info") // info | warn | critical
  userId      String?
  blueprintId String?
  metadata    String?  // JSON stringified details
  createdAt   DateTime @default(now())

  @@index([type, createdAt])
  @@index([severity, createdAt])
}
```

- [ ] **Step 2: Push the schema to the dev database (wipes all data)**

IMPORTANT: Use the dev branch DATABASE_URL from `.env.local`.

```bash
DATABASE_URL="postgresql://neondb_owner:npg_VAj9DXBFqpn6@ep-hidden-mouse-anamh99d-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" npx prisma db push --force-reset
```

The `--force-reset` flag drops all tables and recreates them. This wipes all data (confirmed with user).

Then regenerate the client:
```bash
npm run db:generate
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: rewrite schema for RoughInHub pivot — Blueprint, BlueprintFile, drop AI tables"
```

---

### Task 2: Update Constants and Remove AI Dependencies

**Files:**
- Modify: `src/lib/constants.ts`
- Delete: `src/lib/tokenize.ts`
- Delete: `src/lib/format-tokens.ts`
- Delete: `src/lib/security/` (entire directory)
- Delete: `src/lib/source-verify.ts` (if exists)
- Delete: `tests/lib/tokenize.test.ts`
- Delete: `tests/lib/format-tokens.test.ts`
- Delete: `tests/api/skills-tokenize.test.ts`
- Delete: `src/lib/formats.ts` (skill file formats)

- [ ] **Step 1: Rewrite constants**

Replace `src/lib/constants.ts` with:

```typescript
// Revenue split
export const PLATFORM_FEE_PERCENT = 15;
export const CREATOR_PAYOUT_PERCENT = 100 - PLATFORM_FEE_PERCENT;
export const MIN_PRICE = 0.99;
export const DOWNLOAD_TOKEN_EXPIRY_DAYS = 365;

// File upload limits
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_FILES_PER_BLUEPRINT = 10;
export const MAX_STORAGE_PER_CREATOR_BYTES = 500 * 1024 * 1024; // 500MB
export const UPLOAD_RATE_LIMIT = 5; // per minute per user
export const UPLOAD_RATE_WINDOW_MS = 60_000;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/quicktime", // .mov
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf", ".xlsx", ".xls", ".docx", ".doc", ".zip", ".mp4", ".mov",
] as const;

// Blueprint categories
export const BLUEPRINT_CATEGORIES = [
  { value: "estimating-bidding", label: "Estimating & Bidding" },
  { value: "service-repair", label: "Service & Repair Checklists" },
  { value: "proposals-contracts", label: "Proposals & Contracts" },
  { value: "training", label: "Training & Apprentice Materials" },
  { value: "marketing", label: "Marketing & Client Acquisition" },
  { value: "safety-compliance", label: "Safety & Compliance" },
  { value: "residential", label: "Residential Plumbing" },
  { value: "commercial", label: "Commercial Plumbing" },
] as const;

// Blueprint file types
export const BLUEPRINT_TYPES = [
  { value: "pdf", label: "PDF", icon: "FileText" },
  { value: "excel", label: "Excel Spreadsheet", icon: "Sheet" },
  { value: "zip-pack", label: "ZIP Bundle", icon: "Archive" },
  { value: "video", label: "Video", icon: "Video" },
  { value: "doc", label: "Word Document", icon: "FileText" },
] as const;
```

- [ ] **Step 2: Delete AI-specific files**

```bash
rm -f src/lib/tokenize.ts src/lib/format-tokens.ts src/lib/formats.ts src/lib/source-verify.ts
rm -rf src/lib/security/
rm -f tests/lib/tokenize.test.ts tests/lib/format-tokens.test.ts tests/api/skills-tokenize.test.ts
rm -rf src/app/api/happie/ src/app/api/github-import/ src/app/api/github-verify/
rm -f src/components/happie.tsx
```

- [ ] **Step 3: Remove `@anthropic-ai/sdk` dependency**

```bash
npm uninstall @anthropic-ai/sdk
```

- [ ] **Step 4: Run tests to check what's still passing**

```bash
npx vitest run 2>&1 || true
```

Some tests will fail due to removed security modules. Note which tests reference deleted code — those tests should also be deleted. Delete any test files under `src/lib/security/__tests__/` that reference removed modules.

```bash
rm -rf src/lib/security/
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove AI dependencies, update constants for RoughInHub"
```

---

### Task 3: New Color Palette and Theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update CSS variables**

In `src/app/globals.css`, replace the `:root` and `[data-theme="light"]` variable blocks with RoughInHub's plumbing-trade palette:

```css
:root {
  --bg: #0A1628;
  --bg-secondary: #0F1D32;
  --bg-card: #13243D;
  --bg-card-hover: #182B48;
  --border: #1E3554;
  --text: #E8ECF1;
  --text-secondary: #8899AD;
  --accent: #FF6200;
  --accent-hover: #E55800;
  --accent-soft: rgba(255, 98, 0, 0.15);
  --green: #22c55e;
  --yellow: #eab308;
  --blue: #3b82f6;
  --font-hero: var(--font-space-grotesk);
  --font-body: var(--font-space-grotesk);
}

[data-theme="light"] {
  --bg: #F4F6F8;
  --bg-secondary: #E8ECF0;
  --bg-card: #FFFFFF;
  --bg-card-hover: #F8F9FA;
  --border: #D1D9E0;
  --text: #0A1628;
  --text-secondary: #4A5568;
  --accent: #FF6200;
  --accent-hover: #E55800;
  --accent-soft: rgba(255, 98, 0, 0.1);
}
```

Also remove the `--font-hero: var(--font-jacques-francois)` reference and any Jacques Francois font import from `layout.tsx` (next task). Both hero and body now use Space Grotesk — clean, modern, trades-friendly.

- [ ] **Step 2: Verify no Jacques Francois references remain in globals.css**

Search for `jacques` in the file. If found, replace with `space-grotesk` or `var(--font-body)`.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: new RoughInHub color palette — navy blue + safety orange"
```

---

### Task 4: Update Root Layout Metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update all metadata**

In `src/app/layout.tsx`:

1. Remove the Jacques Francois font import. Keep Space Grotesk only.

2. Replace the metadata object:

```typescript
export const metadata: Metadata = {
  title: "RoughInHub — Real Plumbing Blueprints from Real Plumbers",
  description:
    "Buy battle-tested plumbing bid calculators, checklists, proposals, contracts, and training materials from experienced plumbers. Instant access, automatic updates.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "RoughInHub — Real Plumbing Blueprints from Real Plumbers",
    description:
      "Buy battle-tested plumbing bid calculators, checklists, proposals, contracts, and training materials from experienced plumbers.",
    type: "website",
    siteName: "RoughInHub",
  },
};
```

3. Remove the Happie widget component from the JSX. Remove its import.

4. Remove the ServiceWorker component if it references Skill Shope.

5. Update the `manifest` link if present to point to the updated `manifest.json`.

- [ ] **Step 2: Update manifest.json**

Replace `public/manifest.json`:

```json
{
  "name": "RoughInHub",
  "short_name": "RoughInHub",
  "description": "Real Plumbing Blueprints from Real Plumbers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A1628",
  "theme_color": "#FF6200",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx public/manifest.json
git commit -m "feat: RoughInHub metadata, remove AI widget, update manifest"
```

---

### Task 5: Update Navbar

**Files:**
- Modify: `src/components/navbar.tsx`

- [ ] **Step 1: Replace all Skill Shope references**

In `src/components/navbar.tsx`:

1. Replace the logo/brand text. Where it says "Skill Shope" or renders the Logo component, replace with plain text "RoughInHub" styled in the accent color, or keep the Logo component but update it.

2. Replace "Browse" link text — keep it as "Browse" (works for both).

3. Replace "Publish" button text with "Sell a Blueprint".

4. In the mobile menu, replace all "Skill Shope", "Publish", "Dashboard" references:
   - "Publish" → "Sell a Blueprint"
   - "Dashboard" → "My Library"

5. Remove any references to "skills", "MCP", "agents".

- [ ] **Step 2: Update dropdown menu items**

In the user dropdown:
- "Profile" → keep
- "Dashboard" → "My Library"
- "Admin" → keep (if admin)
- "Sign Out" → keep

- [ ] **Step 3: Commit**

```bash
git add src/components/navbar.tsx
git commit -m "feat: RoughInHub navbar — new brand, plumbing language"
```

---

### Task 6: Rewrite Homepage

**Files:**
- Rewrite: `src/app/page.tsx`

This is a full rewrite. The new homepage speaks directly to plumbing contractors.

- [ ] **Step 1: Write the new homepage**

Replace `src/app/page.tsx` entirely. The page should have these sections:

**Hero Section:**
```
RoughInHub — Real Plumbing Blueprints from Real Plumbers

You've already done the hard work sweating pipes and perfecting your systems.

Now get paid for the smart bid calculators, checklists, proposals, contracts,
and training materials you've built.

Buy once → Instant access in your library → Automatic updates.

[Browse Blueprints]  [Sell Your Blueprints]
```

**Featured Blueprints:** Grid of up to 6 featured blueprints from the database. Use BlueprintCard component (will be created in next task). If no blueprints exist yet, show a "Coming soon" message.

**Categories Section:** Display the 8 plumbing categories from `BLUEPRINT_CATEGORIES` constant. Each links to `/browse?category={value}`. Use appropriate Lucide icons:
- Estimating & Bidding → Calculator
- Service & Repair → ClipboardCheck
- Proposals & Contracts → FileSignature
- Training & Apprentice → GraduationCap
- Marketing & Client Acquisition → Megaphone
- Safety & Compliance → ShieldCheck
- Residential Plumbing → Home
- Commercial Plumbing → Building2

**How It Works:** Simple 3-step flow:
1. Browse proven blueprints from real plumbers
2. Buy once — instant access in your library
3. Get automatic updates when the creator improves the file

**CTA Footer:**
```
Stop reinventing the wheel. Buy battle-tested plumbing templates.
[Browse Blueprints]
```

The page should be a server component that fetches featured blueprints from Prisma. Import from `@/lib/prisma`. Use the new color scheme (navy bg, orange accent buttons).

- [ ] **Step 2: Verify the page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000` — should show the new homepage. May error on BlueprintCard import (created in next task) — that's OK, use a simple placeholder card inline for now.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: RoughInHub homepage — hero, categories, how it works"
```

---

### Task 7: Create BlueprintCard Component

**Files:**
- Create: `src/components/blueprint-card.tsx`
- Delete: `src/components/skill-card.tsx`

- [ ] **Step 1: Create the blueprint card**

Create `src/components/blueprint-card.tsx`:

```typescript
import Link from "next/link";
import {
  Download,
  FileText,
  Sheet,
  Archive,
  Video,
  MapPin,
} from "lucide-react";

type BlueprintCardProps = {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  price: number;
  isFree: boolean;
  downloads: number;
  region: string | null;
  authorName: string | null;
  authorImage: string | null;
};

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  excel: Sheet,
  "zip-pack": Archive,
  video: Video,
  doc: FileText,
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  excel: "Excel",
  "zip-pack": "ZIP Bundle",
  video: "Video",
  doc: "Word Doc",
};

const categoryLabels: Record<string, string> = {
  "estimating-bidding": "Estimating & Bidding",
  "service-repair": "Service & Repair",
  "proposals-contracts": "Proposals & Contracts",
  training: "Training & Apprentice",
  marketing: "Marketing",
  "safety-compliance": "Safety & Compliance",
  residential: "Residential",
  commercial: "Commercial",
};

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function BlueprintCard(props: BlueprintCardProps) {
  const TypeIcon = typeIcons[props.type] || FileText;

  return (
    <Link href={`/blueprints/${props.slug}`}>
      <div className="card-hover group relative flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <TypeIcon className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {typeLabels[props.type] || props.type}
            </span>
          </div>
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {props.name}
        </h3>
        <p className="mb-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3">
          {props.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
            {categoryLabels[props.category] || props.category}
          </span>
          {props.region && (
            <span className="flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
              <MapPin className="h-2.5 w-2.5" />
              {props.region}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatDownloads(props.downloads)}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              props.isFree ? "text-[var(--green)]" : "text-[var(--accent)]"
            }`}
          >
            {props.isFree ? "Free" : `$${props.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Delete old skill card**

```bash
rm -f src/components/skill-card.tsx
```

- [ ] **Step 3: Update imports everywhere that referenced SkillCard**

Search for `skill-card` or `SkillCard` imports in `src/app/browse/page.tsx`, `src/app/page.tsx`, and any other files. Replace with `BlueprintCard` from `@/components/blueprint-card`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: BlueprintCard component, remove SkillCard"
```

---

### Task 8: Update Browse Page

**Files:**
- Modify: `src/app/browse/page.tsx`

- [ ] **Step 1: Rewrite the browse page for blueprints**

Major changes needed:
1. Replace all `Skill` types and references with `Blueprint`
2. Replace `prisma.skill.findMany` with `prisma.blueprint.findMany`
3. Remove AI-specific filters: type (skill/mcp-server/agent), compatibility, listing type (original/community), owned filter, bundles view
4. Add plumbing-specific filters:
   - Category dropdown using `BLUEPRINT_CATEGORIES` from constants
   - Type filter using `BLUEPRINT_TYPES` (pdf/excel/zip-pack/video/doc)
   - Region text input (simple text search)
   - Pricing filter (free/paid) — keep existing
   - Sort: newest, price-low, price-high, most-downloaded
5. Replace `<SkillCard>` with `<BlueprintCard>`
6. Update page title to "Browse Blueprints"
7. Remove all references to "skills", "MCP servers", "agents", GitHub stars/forks, security scores, etc.

The Prisma query should:
```typescript
const where: Record<string, unknown> = {};
if (q) {
  where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
    { tags: { contains: q, mode: "insensitive" } },
  ];
}
if (category) where.category = category;
if (type) where.type = type;
if (region) where.region = { contains: region, mode: "insensitive" };
if (pricing === "free") where.isFree = true;
if (pricing === "paid") where.isFree = false;
where.hidden = false;
```

- [ ] **Step 2: Verify the page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/browse` — should show the filtered browse page (empty results until seeded).

- [ ] **Step 3: Commit**

```bash
git add src/app/browse/page.tsx
git commit -m "feat: browse page — plumbing categories, blueprint filters"
```

---

### Task 9: Update API Routes — Blueprints CRUD

**Files:**
- Rename/rewrite: `src/app/api/skills/route.ts` → `src/app/api/blueprints/route.ts`
- Rename/rewrite: `src/app/api/skills/[id]/route.ts` → `src/app/api/blueprints/[id]/route.ts`
- Delete: `src/app/api/skills/` (old directory after moving)

- [ ] **Step 1: Create the blueprints API route**

Create `src/app/api/blueprints/route.ts`:

**GET handler:** List blueprints with search, category, type, region filters. Same pattern as the old skills GET but querying `prisma.blueprint`. No security pipeline, no source verification.

**POST handler:** Create a new blueprint. Required fields: name, slug, description, category, type. Optional: longDescription, price, isFree, region, tags. Remove all: sourceUrl, sourceType, installCmd, skillContent, listingType, originalAuthor, originalUrl, compatibility, security pipeline, token counting.

Validation:
- name: required, 2-100 chars
- slug: required, valid format, unique
- description: required, 10-500 chars
- category: required, must be one of BLUEPRINT_CATEGORIES values
- type: required, must be one of BLUEPRINT_TYPES values
- price: if not free, >= 0.99

Keep rate limiting (5 publishes per 60s per user). Keep auth check. Keep sanitization.

- [ ] **Step 2: Create the blueprint detail/update/delete route**

Create `src/app/api/blueprints/[id]/route.ts`:

**GET:** Fetch blueprint by ID with author info.
**PATCH:** Update blueprint fields (author only).
**DELETE:** Delete blueprint (author only).

Same authorization pattern as old skills `[id]` route but with Blueprint fields.

- [ ] **Step 3: Delete old skills API routes**

```bash
rm -rf src/app/api/skills/
```

- [ ] **Step 4: Delete other AI-specific API routes**

```bash
rm -rf src/app/api/happie/
rm -rf src/app/api/github-import/
rm -rf src/app/api/github-verify/
rm -rf src/app/api/registry/
rm -f src/app/api/admin/happie-stats/
rm -f src/app/api/admin/security-scan/
rm -f src/app/api/admin/verify-source/
rm -rf src/app/api/api-keys/
rm -rf src/app/api/projects/
rm -rf src/app/api/analytics/
```

Also delete routes that reference removed models:
```bash
rm -rf src/app/api/bundles/
rm -rf src/app/api/reviews/
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: blueprint CRUD API, remove all AI/skill API routes"
```

---

### Task 10: Clean Up Remaining Skill References

**Files:**
- Various files across the codebase

- [ ] **Step 1: Global search and replace**

Search the entire `src/` directory for remaining references to:
- `skill` / `Skill` / `skills` / `Skills` (in code, not comments)
- `MCP` / `mcp-server` / `mcp`
- `agent` (in the context of AI agents, not user-agent)
- `Skill Shope` / `SkillShope` / `skillshope`
- `npx skillshope`
- `SKILL.md`
- `claude-code` / `codex` / `cursor` / `windsurf`
- `publisher` (replace with "creator" where appropriate)

Replace with RoughInHub / blueprint / plumbing equivalents.

Key files to check:
- `src/app/skills/[slug]/page.tsx` → rename to `src/app/blueprints/[slug]/page.tsx`
- `src/components/install-card.tsx` → rewrite as download card (Plan 3)
- `src/components/publish-form.tsx` → rewrite (Plan 2)
- `src/app/dashboard/page.tsx` → rewrite as library (Plan 3)
- `src/app/publish/page.tsx` → update imports
- `src/lib/auth.ts` → check for skill references
- `src/lib/prisma.ts` → should be fine (generic)
- `src/lib/validation.ts` → should be fine (generic)
- `src/lib/rate-limit.ts` → should be fine (generic)
- `src/lib/purchases.tsx` → update for blueprints
- `src/app/api/checkout/route.ts` → update for blueprints
- `src/app/api/webhooks/stripe/route.ts` → update for blueprints
- `src/app/api/deliver/` → update for blueprints

For files that will be fully rewritten in Plans 2 & 3, just stub them out with a placeholder page that says "Coming soon" so the app compiles.

- [ ] **Step 2: Rename the skills detail page directory**

```bash
mv src/app/skills/ src/app/blueprints/
```

Update the `[slug]/page.tsx` inside to reference Blueprint instead of Skill. For now, it can be a simplified version — full rewrite comes in Plan 3.

- [ ] **Step 3: Verify build compiles**

```bash
npm run build 2>&1 | tail -30
```

Fix any remaining type errors or broken imports. The goal is a clean build, even if some pages are stubs.

- [ ] **Step 4: Run remaining tests**

```bash
npx vitest run 2>&1 || true
```

Fix or delete any tests that reference removed code. The validation and rate-limit tests should still pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean up all Skill Shope references, rename routes to blueprints"
```

---

### Task 11: Update Footer and Remaining Components

**Files:**
- Modify: `src/components/footer.tsx` (if exists)
- Modify: `src/components/logo.tsx`
- Delete: `src/components/share-button.tsx` (if Skill Shope specific)
- Modify: `src/app/auth/signin/page.tsx`

- [ ] **Step 1: Update footer**

Replace all "Skill Shope" text with "RoughInHub". Update any taglines. Remove links to AI-specific docs (verification, security, CLI reference, etc.).

Keep: Browse, Publish (rename to "Sell"), Terms, Privacy.

- [ ] **Step 2: Update logo component**

For now, replace the SVG-based logo with a simple text logo:

```typescript
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`text-xl font-bold ${className || ""}`}>
      <span className="text-[var(--accent)]">Rough</span>
      <span className="text-[var(--text)]">InHub</span>
    </span>
  );
}
```

This is a placeholder until a real logo is designed.

- [ ] **Step 3: Update sign-in page**

In `src/app/auth/signin/page.tsx`, replace "Skill Shope" with "RoughInHub" and update the tagline to something like "Sign in to access your plumbing blueprints."

- [ ] **Step 4: Verify the app runs end-to-end**

```bash
npm run dev
```

Navigate through: homepage, browse, sign-in. Everything should render with the new branding. Publish and dashboard pages may be stubs.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: RoughInHub branding across footer, logo, sign-in"
```

---

### Task 12: Delete Unused Docs, Pages, and Static Assets

**Files:**
- Delete: `src/app/docs/` (AI-specific documentation pages)
- Delete: `src/app/bundles/` (removed feature)
- Delete: `public/.well-known/skills.json` (if exists)
- Delete: `community-listings/` (if exists)
- Modify: `src/app/robots.txt/` and `src/app/sitemap.xml/` routes if they reference skills

- [ ] **Step 1: Remove documentation pages**

The existing docs pages cover AI skills publishing, CLI reference, security verification, etc. — all irrelevant. Delete the entire docs directory:

```bash
rm -rf src/app/docs/
rm -rf src/app/bundles/
```

- [ ] **Step 2: Clean up public assets**

```bash
rm -f public/.well-known/skills.json
```

- [ ] **Step 3: Update sitemap/robots if they exist as route handlers**

Check `src/app/sitemap.xml/` and `src/app/robots.txt/` — update any Skill Shope references to RoughInHub and update URLs to reference `/blueprints/` instead of `/skills/`.

- [ ] **Step 4: Final build verification**

```bash
npm run build
```

Expected: Clean build with no errors. Some pages are stubs but everything compiles.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove AI docs, bundles, unused assets"
```

---

## Summary

After completing all 12 tasks, you will have:
- Clean Prisma schema with Blueprint, BlueprintFile, Purchase, DownloadToken, AuditLog
- Dev database wiped and synced to new schema
- Full RoughInHub branding: navy+orange palette, new metadata, navbar, footer
- New homepage with plumbing-specific hero, categories, and CTA
- BlueprintCard component replacing SkillCard
- Browse page with plumbing categories and filters
- Blueprint CRUD API routes
- All AI/MCP/CLI features removed
- Clean build

**What's NOT in this plan (covered in Plans 2 & 3):**
- File upload with Vercel Blob (Plan 2)
- Creator publishing form (Plan 2)
- Buyer library/dashboard (Plan 3)
- Purchase flow updates (Plan 3)
- Secure file download (Plan 3)
- Seed 10 blueprints (Plan 3)
