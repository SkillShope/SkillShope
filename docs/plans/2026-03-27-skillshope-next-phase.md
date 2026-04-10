# Skill Shope Next Phase — Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Skill Shope from a registry into the production-ready, creator-first distribution platform for AI skills — with working CLI, reliability tooling, publisher analytics, and marketing that speaks to builders who are tired of giants taking their work.

**Architecture:** Five sequential phases, each shipping independently. Phase 1 (marketing) sets the narrative. Phase 2 (analytics) gives publishers a reason to stay. Phase 3 (CLI) makes distribution real. Phase 4 (reliability skills) differentiates from directories. Phase 5 (production readiness) locks in the trust layer.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma 6 + PostgreSQL (Neon), Tailwind CSS v4, Stripe Connect, Lucide React. CLI: Node.js standalone npm package.

**Positioning:** "You built it. You earned it." — creator-first, anti-giant, production-ready.

---

## Phase 1: Marketing Overhaul — "You Built It. You Earned It."

**Goal:** Rewrite all public-facing copy to speak directly to builders who are tired of giving away their work. Componentize the footer. Fix hardcoded category counts.

**Tone guide:**
- First person plural ("we") = the Skill Shope community, not a corporation
- Acknowledge the pain: giants ship models, take your tools, give nothing back
- Promise: fair economics, one-command distribution, your IP stays yours
- No corporate buzzwords. Speak like a dev who's been burned.

### Task 1.1: Create shared Footer component

**Files:**
- Create: `src/components/footer.tsx`
- Modify: `src/app/page.tsx` (extract footer, replace inline)
- Modify: `src/app/layout.tsx` (add Footer to all pages)

- [ ] **Step 1: Create `src/components/footer.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <Logo width={28} height={28} />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              You built it. You earned it.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Product</h4>
            <nav className="space-y-2">
              <Link href="/browse" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Browse Skills</Link>
              <Link href="/publish" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Publish</Link>
              <Link href="/bundles" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Bundles</Link>
              <Link href="/docs" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Docs</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Developers</h4>
            <nav className="space-y-2">
              <Link href="/docs/cli-reference" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">CLI Reference</Link>
              <Link href="/docs/json-schema" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">JSON Schema</Link>
              <Link href="/docs/api-reference" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">API Reference</Link>
              <Link href="/docs/security" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Security</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Legal</h4>
            <nav className="space-y-2">
              <Link href="/terms" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Terms</Link>
              <Link href="/privacy" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Privacy</Link>
              <Link href="/about" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">About</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} Skill Shope. Built by builders, for builders.</p>
          <p className="mt-2">
            Skill Shope is a registry — we do not host, execute, or guarantee third-party skills.{" "}
            <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link> &middot;{" "}
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Remove inline footer from `src/app/page.tsx`**

Delete the entire `{/* Footer */}` section (currently lines ~223-263) from page.tsx.

- [ ] **Step 3: Add Footer to `src/app/layout.tsx`**

Import and render `<Footer />` after `<ConsentBanner />` so it appears on every page:

```tsx
import { Footer } from "@/components/footer";
// ... in the JSX:
        <ConsentBanner />
        <Footer />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/footer.tsx src/app/page.tsx src/app/layout.tsx
git commit -m "feat: extract Footer into shared component, add to all pages"
```

### Task 1.2: Rewrite homepage hero and CTA copy

**Files:**
- Modify: `src/app/page.tsx` (hero section, CTA section, FAQ)

- [ ] **Step 1: Rewrite the hero section**

Replace the current hero content with creator-first messaging:

**Badge:** `"Stop giving your tools away for free"`

**H1:** `"You built it. Now get paid for it."`

**Subtitle:** `"The giants ship models. You build the tools that make them useful. Skill Shope is the registry where your AI skills, MCP servers, and agents earn what they deserve — distributed in one command, protected by default."`

- [ ] **Step 2: Rewrite the CTA section**

Replace "Share what you've built" with stronger creator-first copy:

**H2:** `"Your code. Your rules. Your revenue."`

**Body:** `"Every skill you publish stays yours. Set your price — or give it away. We handle distribution, security scanning, and payouts. You keep 85%. The giants keep zero."`

**Button text:** `"Start Earning" -> /publish`

Add a secondary line below: `"Free to publish. No approval queue. Live in minutes."`

- [ ] **Step 3: Update FAQ to reinforce positioning**

Update/add these FAQ items:
- "How is this different from GitHub?" — "GitHub hosts code. We handle discovery, security verification, paid distribution with IP protection, and one-command installs. Your users don't need to clone repos or read READMEs."
- "Why not just use the official Anthropic skills repo?" — "You can. But you can't charge for them, get analytics, or control distribution. Skill Shope gives you the creator economics that vendor repos don't."
- "Is my paid content protected?" — Strengthen: "Paid skills are delivered via time-limited, cryptographically-signed download tokens. The code is never exposed publicly. You set the price, we protect the distribution."

- [ ] **Step 4: Fix hardcoded category counts**

Replace the static `count: 0` with actual counts from the database. Add this to the server data fetching:

```tsx
const categoryCounts = await prisma.skill.groupBy({
  by: ["category"],
  where: { hidden: false, reviewStatus: { in: ["approved", "pending"] } },
  _count: true,
});
const countMap = Object.fromEntries(categoryCounts.map((c) => [c.category, c._count]));
```

Then use `countMap[slug] || 0` for each category's count.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: creator-first marketing copy, dynamic category counts"
```

### Task 1.3: Rewrite About page

**Files:**
- Modify: `src/app/about/page.tsx`

- [ ] **Step 1: Rewrite About page with creator-first narrative**

New structure:
- **Hero:** "Built by a builder who got tired of building for free."
- **The problem:** "You spend weeks building an AI skill that saves developers hours. You publish it on GitHub. A giant forks it, ships it in their marketplace, and you get a star. We think you deserve more than a star."
- **The solution:** "Skill Shope is the independent registry where creators set their price, keep their IP, and get 85% of every sale. One-command installs. Security scanning. Download token protection. No approval queues."
- **Values:** Replace the 4 generic cards with:
  1. "Creators first" — 85% payout, no approval queue, live in minutes
  2. "Your IP, protected" — download tokens, not public repos
  3. "One command" — `npx skillshope install <slug>`, done
  4. "Vendor neutral" — works with Claude, Codex, Cursor, Windsurf, any MCP client

- [ ] **Step 2: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: rewrite About page with creator-first narrative"
```

---

## Phase 2: Publisher Analytics Dashboard

**Goal:** Give publishers visibility into how their skills are performing — installs by source, trends over time. The API endpoint already exists at `/api/analytics/[skillId]`; this phase adds the UI.

### Task 2.1: Add analytics section to dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx` (fetch analytics data per skill)
- Modify: `src/components/dashboard-client.tsx` (render analytics charts/stats)

- [ ] **Step 1: Fetch install analytics per skill in dashboard page**

In `src/app/dashboard/page.tsx`, after fetching skills, aggregate install events:

```tsx
const installStats = await prisma.installEvent.groupBy({
  by: ["skillId", "source"],
  where: { skillId: { in: skills.map((s) => s.id) } },
  _count: true,
});

const last7dInstalls = await prisma.installEvent.groupBy({
  by: ["skillId"],
  where: {
    skillId: { in: skills.map((s) => s.id) },
    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  },
  _count: true,
});
```

Pass these as props to DashboardClient.

- [ ] **Step 2: Add install breakdown to the skills table**

In `src/components/dashboard-client.tsx`, add a collapsible row detail or a new "Installs" column showing:
- Total installs (with 7d trend arrow up/down)
- Breakdown by source: CLI / Web / API as small pills

- [ ] **Step 3: Add a simple "Top Skills This Week" summary card**

Above the skills table, add a card showing the top 3 skills by installs in the last 7 days with mini bar indicators.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/dashboard-client.tsx
git commit -m "feat: publisher analytics — install stats, source breakdown, 7d trends"
```

---

## Phase 3: CLI Package (`skillshope`)

**Goal:** Build the actual npm package that makes `npx skillshope install <slug>` work end-to-end. This is the single most critical piece — without it, the marketplace is theoretical.

> **NOTE:** This is a separate npm package. It should live in a `packages/cli/` directory within the monorepo (or a separate repo). The plan below assumes `packages/cli/`.

### Task 3.1: Scaffold CLI package

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts` (entry point)
- Create: `packages/cli/src/config.ts` (config management)
- Create: `packages/cli/src/api.ts` (registry API client)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "skillshope",
  "version": "0.1.0",
  "description": "Install AI skills, MCP servers, and agents from Skill Shope",
  "bin": { "skillshope": "./dist/index.js" },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.9.0",
    "@types/node": "^22.0.0"
  }
}
```

Zero runtime dependencies — use Node.js built-in `fetch`, `fs`, `path`, `crypto`.

- [ ] **Step 2: Create config manager (`src/config.ts`)**

Reads/writes `~/.skillshope/config.json`:
```typescript
type Config = {
  registryUrl: string;
  token?: string;
};

const CONFIG_DIR = join(homedir(), ".skillshope");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const DEFAULT_REGISTRY = "https://skillshope.com";

export function loadConfig(): Config { /* ... */ }
export function saveConfig(config: Partial<Config>): void { /* ... */ }
export function getToken(): string | undefined { /* ... */ }
```

- [ ] **Step 3: Create API client (`src/api.ts`)**

```typescript
export async function fetchSkill(slug: string, token?: string): Promise<SkillResponse> {
  const config = loadConfig();
  const url = `${config.registryUrl}/api/registry/${slug}`;
  const headers: Record<string, string> = { "User-Agent": "skillshope-cli" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // ... fetch, handle errors, return typed response
}

export async function fetchFiles(skillId: string, downloadToken?: string): Promise<FileResponse> {
  // Calls /api/deliver/[skillId]?token=xxx&source=cli
}
```

- [ ] **Step 4: Create entry point (`src/index.ts`)**

```typescript
#!/usr/bin/env node
const [,, command, ...args] = process.argv;

switch (command) {
  case "install": case "add": return install(args[0]);
  case "login": return login();
  case "whoami": return whoami();
  case "list": case "ls": return list();
  default: return help();
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/cli/
git commit -m "feat: scaffold CLI package with config, API client, and command router"
```

### Task 3.2: Implement `install` command

**Files:**
- Create: `packages/cli/src/commands/install.ts`

- [ ] **Step 1: Implement install flow**

```
1. Parse slug from args
2. Fetch skill metadata from registry API
3. If paid: check for auth token, fetch download token, then fetch files
4. If free: fetch files directly
5. Determine output directory:
   - Skills: .claude/skills/<slug>/
   - MCP servers: .claude/mcp-servers/<slug>/
   - Agents: .claude/agents/<slug>/
6. Write files to disk
7. Print success message with next steps
```

- [ ] **Step 2: Add progress output**

```
$ npx skillshope install code-reviewer-pro
  Fetching code-reviewer-pro...
  Downloading 2 files...
  Installed to .claude/skills/code-reviewer-pro/
  Done.
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/commands/install.ts
git commit -m "feat: implement CLI install command with auth + file delivery"
```

### Task 3.3: Implement `login` and `whoami`

**Files:**
- Create: `packages/cli/src/commands/login.ts`
- Create: `packages/cli/src/commands/whoami.ts`

- [ ] **Step 1: Implement login flow**

Login uses API key authentication (not OAuth — simpler for CLI):
1. Prompt user to visit `https://skillshope.com/profile` to generate an API key
2. User pastes the key
3. Validate key against `/api/auth/verify-key`
4. Save to config

- [ ] **Step 2: Implement whoami**

```
$ skillshope whoami
  Logged in as: ryan-pethel
  Email: ryan@example.com
```

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/commands/
git commit -m "feat: CLI login and whoami commands"
```

---

## Phase 4: First-Party Reliability Skills

**Goal:** Create and publish 3-4 "guardrail" skills that ship with Skill Shope as first-party offerings. These differentiate from directories — we don't just list tools, we build the infrastructure that makes agents work in production.

### Task 4.1: MCP Timeout Guard skill

**Files:**
- Create skill content as SKILL.md
- Publish via Skill Shope as admin

**Skill content:** A Claude Code skill that wraps MCP server calls with configurable timeouts, retry logic, and circuit-breaking. Prevents agents from hanging on unresponsive tools.

### Task 4.2: Loop Detector skill

**Skill content:** Detects when an agent is stuck in a reasoning loop (repeated tool calls, context bloat). Breaks the cycle and provides structured debugging output.

### Task 4.3: Agent Audit Logger skill

**Skill content:** Structured logging for every agent action — tool calls, responses, token usage, timing. Outputs to a local audit log for compliance and debugging.

### Task 4.4: Cost Monitor skill

**Skill content:** Tracks token usage per session/skill. Provides per-request cost estimates and alerts when spending exceeds configurable thresholds.

> These will be published as Skill Shope admin skills (free, featured) once Phases 1-3 are complete.

---

## Phase 5: Production Readiness

**Goal:** Version pinning, dependency resolution, and cost transparency — the features that make enterprises trust Skill Shope for production workloads.

### Task 5.1: Version pinning UI

**Files:**
- Modify: `src/components/install-card.tsx` (version selector dropdown)
- Modify: `src/app/api/deliver/[skillId]/route.ts` (accept version param)

The `SkillVersion` model already exists. Add UI to select a version and pass it to the delivery endpoint.

### Task 5.2: Dependency resolution display

**Files:**
- Modify: `src/app/skills/[slug]/page.tsx` (show dependencies)
- Add dependency check to install flow

The `SkillDependency` model already exists. Display dependencies on the skill detail page and warn during install if dependencies are missing.

### Task 5.3: Cost transparency

**Files:**
- Create: `src/components/cost-badge.tsx`

For paid skills, show transparent pricing: skill price, platform fee breakdown, publisher payout. "You pay $X. Publisher receives $Y. Platform fee: $Z."

---

## Execution Sequence

| Phase | Effort | Dependencies | Ships |
|-------|--------|-------------|-------|
| Phase 1: Marketing | 2-3 hours | None | Immediately |
| Phase 2: Analytics | 1-2 hours | None | Immediately |
| Phase 3: CLI | 4-6 hours | Phases 1-2 (for messaging) | After testing |
| Phase 4: Reliability Skills | 2-3 hours | Phase 3 (for install flow) | After CLI ships |
| Phase 5: Production Readiness | 3-4 hours | Phase 3 | After CLI ships |

**Total: ~15-20 hours of focused work.**

Phase 1 is the highest-leverage immediate action. Phase 3 is the most critical technical work. Phases 4-5 are the long-term differentiation.
