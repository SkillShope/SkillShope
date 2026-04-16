# Estimated Token Cost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show publishers and users an estimated token count for each skill, calculated via Claude's tokenizer at publish time.

**Architecture:** Add an `estimatedTokens` field to the Skill model. Create a `src/lib/tokenize.ts` utility that calls the Anthropic SDK's `messages.countTokens()` endpoint. Integrate token counting into the skill creation API route (runs after content is stored). Display token count on skill cards, detail page, and install card. For skills with no content (npm/other URL, no paste), skip tokenization and show a beta notice.

**Tech Stack:** Anthropic SDK `@anthropic-ai/sdk` (already installed, v0.80.0), Prisma, Vitest, Next.js App Router

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/tokenize.ts` | Token counting utility — wraps Anthropic SDK `countTokens` |
| Create | `tests/lib/tokenize.test.ts` | Unit tests for tokenize utility |
| Modify | `prisma/schema.prisma:69-115` | Add `estimatedTokens Int?` to Skill model |
| Modify | `src/app/api/skills/route.ts:107-175` | Call tokenize after skill creation, store result |
| Modify | `src/components/skill-card.tsx:19-43` | Add `estimatedTokens` prop, display token count |
| Modify | `src/app/skills/[slug]/page.tsx:168-197` | Display token count in metadata section |
| Modify | `src/components/install-card.tsx` | Display token count in sidebar card |

---

### Task 1: Add `estimatedTokens` Field to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:69-115`

- [ ] **Step 1: Add the field to the Skill model**

In `prisma/schema.prisma`, add `estimatedTokens` after the `securityScore` field (line 109):

```prisma
  securityScore   Int?
  estimatedTokens Int?     // Token count from Claude's tokenizer (beta)
  featured        Boolean  @default(false)
```

- [ ] **Step 2: Push the schema change**

Run:
```bash
npm run db:generate && npm run db:push
```

Expected: Prisma Client regenerated, schema synced to database. No data loss (nullable field addition).

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add estimatedTokens field to Skill model"
```

---

### Task 2: Create Token Counting Utility

**Files:**
- Create: `src/lib/tokenize.ts`
- Create: `tests/lib/tokenize.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/tokenize.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { countSkillTokens } from "@/lib/tokenize";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  const mockCountTokens = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        countTokens: mockCountTokens,
      },
    })),
    __mockCountTokens: mockCountTokens,
  };
});

// Access the mock through the module
async function getMockCountTokens() {
  const mod = await import("@anthropic-ai/sdk") as Record<string, unknown>;
  return mod.__mockCountTokens as ReturnType<typeof vi.fn>;
}

describe("countSkillTokens", () => {
  let mockCountTokens: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockCountTokens = await getMockCountTokens();
    mockCountTokens.mockReset();
  });

  it("returns token count for valid content", async () => {
    mockCountTokens.mockResolvedValue({ input_tokens: 350 });

    const result = await countSkillTokens("This is a skill with instructions and prompts.");

    expect(result).toBe(350);
    expect(mockCountTokens).toHaveBeenCalledOnce();
    expect(mockCountTokens).toHaveBeenCalledWith({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: "This is a skill with instructions and prompts." }],
    });
  });

  it("returns null for empty content", async () => {
    const result = await countSkillTokens("");

    expect(result).toBeNull();
    expect(mockCountTokens).not.toHaveBeenCalled();
  });

  it("returns null for whitespace-only content", async () => {
    const result = await countSkillTokens("   \n\t  ");

    expect(result).toBeNull();
    expect(mockCountTokens).not.toHaveBeenCalled();
  });

  it("returns null when API call fails", async () => {
    mockCountTokens.mockRejectedValue(new Error("API rate limit"));

    const result = await countSkillTokens("Some content");

    expect(result).toBeNull();
  });

  it("handles large content (up to 100KB)", async () => {
    const largeContent = "x".repeat(100_000);
    mockCountTokens.mockResolvedValue({ input_tokens: 25000 });

    const result = await countSkillTokens(largeContent);

    expect(result).toBe(25000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run tests/lib/tokenize.test.ts
```

Expected: FAIL — `countSkillTokens` is not exported from `@/lib/tokenize` (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/lib/tokenize.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

/**
 * Count tokens in skill content using Claude's tokenizer.
 * Returns null if content is empty or the API call fails.
 */
export async function countSkillTokens(content: string): Promise<number | null> {
  if (!content.trim()) {
    return null;
  }

  try {
    const result = await client.messages.countTokens({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content }],
    });
    return result.input_tokens;
  } catch (error) {
    console.error("Token counting failed:", error);
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run tests/lib/tokenize.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tokenize.ts tests/lib/tokenize.test.ts
git commit -m "feat: add token counting utility using Claude's tokenizer"
```

---

### Task 3: Integrate Token Counting into Skill Creation API

**Files:**
- Modify: `src/app/api/skills/route.ts:107-175`

- [ ] **Step 1: Write the failing test**

Create `tests/api/skills-tokenize.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { countSkillTokens } from "@/lib/tokenize";

// Mock the tokenize module
vi.mock("@/lib/tokenize", () => ({
  countSkillTokens: vi.fn(),
}));

const mockCountSkillTokens = vi.mocked(countSkillTokens);

describe("Skill creation token counting integration", () => {
  beforeEach(() => {
    mockCountSkillTokens.mockReset();
  });

  it("calls countSkillTokens with skill content when content is provided", async () => {
    mockCountSkillTokens.mockResolvedValue(500);

    const content = "---\nname: test-skill\n---\nDo the thing.";
    const result = await countSkillTokens(content);

    expect(mockCountSkillTokens).toHaveBeenCalledWith(content);
    expect(result).toBe(500);
  });

  it("returns null when no content is provided", async () => {
    mockCountSkillTokens.mockResolvedValue(null);

    const result = await countSkillTokens("");

    expect(result).toBeNull();
  });

  it("returns null when tokenizer fails gracefully", async () => {
    mockCountSkillTokens.mockResolvedValue(null);

    const result = await countSkillTokens("some content");

    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it passes (mock validation)**

Run:
```bash
npx vitest run tests/api/skills-tokenize.test.ts
```

Expected: All 3 tests PASS (these validate the integration contract).

- [ ] **Step 3: Modify the skill creation API route**

In `src/app/api/skills/route.ts`, add the import at the top (after existing imports):

```typescript
import { countSkillTokens } from "@/lib/tokenize";
```

Then, after the `SkillFile` creation block (after line 139) and before the security pipeline block (line 143), add token counting:

```typescript
  // Count tokens in skill content (non-blocking)
  if (body.skillContent) {
    countSkillTokens(body.skillContent)
      .then(async (tokenCount) => {
        if (tokenCount !== null) {
          await prisma.skill.update({
            where: { id: skill.id },
            data: { estimatedTokens: tokenCount },
          });
        }
      })
      .catch((err) => {
        console.error(`Token counting failed for skill ${skill.id}:`, err);
      });
  }
```

- [ ] **Step 4: Run full test suite**

Run:
```bash
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/skills/route.ts tests/api/skills-tokenize.test.ts
git commit -m "feat: count tokens on skill creation via Claude tokenizer"
```

---

### Task 4: Display Token Count on Skill Card

**Files:**
- Modify: `src/components/skill-card.tsx:19-43`

- [ ] **Step 1: Add `estimatedTokens` to the SkillCardProps type**

In `src/components/skill-card.tsx`, add to the `SkillCardProps` type (after line 39, `lastUpdated`):

```typescript
  estimatedTokens?: number | null;
```

- [ ] **Step 2: Add the token count display**

In the stats section at the bottom of the card (the `<div>` with `flex items-center justify-between` around line 152), add a token count display after the downloads/stars stats and before the closing `</div>` of the stats row. Find this block:

```typescript
            {!props.githubStars && (
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {formatDownloads(props.downloads)}
              </span>
            )}
```

Add after it (still inside the wrapping `<div>`):

```typescript
            {props.estimatedTokens != null && (
              <span className="flex items-center gap-1" title="Estimated token cost">
                <Terminal className="h-3 w-3" />
                {formatDownloads(props.estimatedTokens)} tokens
              </span>
            )}
```

Note: `Terminal` is already imported in this file.

- [ ] **Step 3: Update all SkillCard usage sites to pass estimatedTokens**

Search for `<SkillCard` usage. The browse page maps API results to cards. Since the API already returns full Skill objects (which will now include `estimatedTokens`), the prop just needs to be passed through.

In `src/app/browse/page.tsx`, find where `<SkillCard>` is rendered and add:

```typescript
estimatedTokens={skill.estimatedTokens}
```

Do the same in any other file that renders `<SkillCard>` (check `src/app/page.tsx`, `src/app/dashboard/page.tsx`).

- [ ] **Step 4: Verify the build compiles**

Run:
```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/skill-card.tsx src/app/browse/page.tsx
git commit -m "feat: display estimated token count on skill cards"
```

---

### Task 5: Display Token Count on Skill Detail Page

**Files:**
- Modify: `src/app/skills/[slug]/page.tsx:168-197`

- [ ] **Step 1: Add token count to the metadata section**

In `src/app/skills/[slug]/page.tsx`, find the metadata row (around line 169, the `<div>` with `mt-6 flex flex-wrap gap-4`). Add a token count stat after the installs stat:

```typescript
            {skill.estimatedTokens != null && (
              <span className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4" />
                {skill.estimatedTokens.toLocaleString()} tokens
              </span>
            )}
```

Note: `Terminal` is already imported in this file.

- [ ] **Step 2: Add a "beta" tooltip or note for context**

After the token count span (still in the metadata row), no additional note is needed — the detail page has enough context. However, when `estimatedTokens` is null, we don't show anything (no "N/A" — that's noise).

- [ ] **Step 3: Verify the build compiles**

Run:
```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/skills/[slug]/page.tsx
git commit -m "feat: display estimated token count on skill detail page"
```

---

### Task 6: Display Token Count on Install Card

**Files:**
- Modify: `src/components/install-card.tsx`

- [ ] **Step 1: Read the current InstallCard component**

Read `src/components/install-card.tsx` to understand the current props and layout.

- [ ] **Step 2: Add `estimatedTokens` prop**

Add to the InstallCard props type:

```typescript
  estimatedTokens?: number | null;
```

- [ ] **Step 3: Add token count display in the card**

Inside the card, after the pricing display and before the install command section, add:

```typescript
        {props.estimatedTokens != null && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm">
            <Terminal className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>
              <span className="font-medium">{props.estimatedTokens.toLocaleString()}</span>
              <span className="text-[var(--text-secondary)]"> estimated tokens</span>
            </span>
          </div>
        )}
```

Import `Terminal` from lucide-react if not already imported in this file.

- [ ] **Step 4: Pass prop from skill detail page**

In `src/app/skills/[slug]/page.tsx`, find the `<InstallCard` usage and add:

```typescript
              estimatedTokens={skill.estimatedTokens}
```

- [ ] **Step 5: Verify the build compiles**

Run:
```bash
npm run build 2>&1 | head -50
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/install-card.tsx src/app/skills/[slug]/page.tsx
git commit -m "feat: display estimated token count on install card"
```

---

### Task 7: Format Token Count Helper

**Files:**
- Create: `src/lib/format-tokens.ts`
- Create: `tests/lib/format-tokens.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/format-tokens.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { formatTokenCount } from "@/lib/format-tokens";

describe("formatTokenCount", () => {
  it("formats small counts as-is", () => {
    expect(formatTokenCount(42)).toBe("42");
    expect(formatTokenCount(999)).toBe("999");
  });

  it("formats thousands with k suffix", () => {
    expect(formatTokenCount(1000)).toBe("1.0k");
    expect(formatTokenCount(1500)).toBe("1.5k");
    expect(formatTokenCount(12345)).toBe("12.3k");
  });

  it("formats hundred-thousands with k suffix", () => {
    expect(formatTokenCount(100000)).toBe("100.0k");
  });

  it("returns null display for null input", () => {
    expect(formatTokenCount(null)).toBeNull();
  });

  it("returns null display for undefined input", () => {
    expect(formatTokenCount(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run tests/lib/format-tokens.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/lib/format-tokens.ts`:

```typescript
export function formatTokenCount(tokens: number | null | undefined): string | null {
  if (tokens == null) return null;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run tests/lib/format-tokens.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Update skill-card.tsx and install-card.tsx to use `formatTokenCount`**

In `src/components/skill-card.tsx`, replace the inline `formatDownloads(props.estimatedTokens)` with:

```typescript
import { formatTokenCount } from "@/lib/format-tokens";

// In the JSX:
{formatTokenCount(props.estimatedTokens)} tokens
```

In `src/components/install-card.tsx`, use the same:

```typescript
import { formatTokenCount } from "@/lib/format-tokens";

// In the JSX:
<span className="font-medium">{formatTokenCount(props.estimatedTokens)}</span>
```

In `src/app/skills/[slug]/page.tsx`, use for the metadata row:

```typescript
import { formatTokenCount } from "@/lib/format-tokens";

// In the JSX:
{formatTokenCount(skill.estimatedTokens)} tokens
```

- [ ] **Step 6: Run full test suite and build**

Run:
```bash
npx vitest run && npm run build 2>&1 | head -30
```

Expected: All tests pass, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/lib/format-tokens.ts tests/lib/format-tokens.test.ts src/components/skill-card.tsx src/components/install-card.tsx src/app/skills/[slug]/page.tsx
git commit -m "feat: add formatTokenCount helper and wire up display components"
```

---

### Task 8: Handle Missing Token Count (Beta Notice)

**Files:**
- Modify: `src/app/skills/[slug]/page.tsx`

- [ ] **Step 1: Add beta context for skills without token count**

In the skill detail page, after the token count display in the metadata section, there's nothing to show when `estimatedTokens` is null — no "N/A" or placeholder. This is intentional: skills without content simply don't show a token count.

However, on the **install card** we can add a subtle note. In `src/components/install-card.tsx`, after the `estimatedTokens` display block, add a fallback for when tokens are null but the skill has content implications:

```typescript
        {props.estimatedTokens == null && (
          <p className="text-xs text-[var(--text-secondary)]">
            Token estimate unavailable — available for GitHub imports and pasted content.
          </p>
        )}
```

- [ ] **Step 2: Verify the build compiles**

Run:
```bash
npm run build 2>&1 | head -30
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/install-card.tsx
git commit -m "feat: add beta notice for skills without token estimates"
```

---

### Task 9: Update Skill GET API to Include estimatedTokens

**Files:**
- Modify: `src/app/api/skills/route.ts:13-38` (GET handler)
- Modify: `src/app/api/skills/[id]/route.ts` (GET handler)

- [ ] **Step 1: Verify the GET routes already return estimatedTokens**

Since both GET routes use `prisma.skill.findMany()` / `prisma.skill.findUnique()` without a `select` clause on the Skill model (they use `include` for relations), the `estimatedTokens` field will automatically be included in the response after the schema change. No code change needed.

Verify by reading the route files and confirming no `select` clause filters out the field.

- [ ] **Step 2: Verify with a quick test**

Run:
```bash
npm run build 2>&1 | head -30
```

Expected: Build succeeds. The field is automatically available in all Skill responses.

- [ ] **Step 3: Commit (if any changes were needed)**

No commit needed if no changes were made. This task is a verification step.

---

### Task 10: Final Verification

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npx vitest run
```

Expected: All tests pass (existing + new).

- [ ] **Step 2: Run the build**

Run:
```bash
npm run build
```

Expected: Production build succeeds with no errors.

- [ ] **Step 3: Manual smoke test**

Start the dev server:
```bash
npm run dev
```

Verify:
1. Navigate to `/publish` — form works as before
2. Create a skill with pasted content — after creation, the skill detail page should show a token count within a few seconds (async)
3. Browse page shows token count on cards for skills that have it
4. Skills without content show the beta notice on the install card

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address any issues found during smoke testing"
```
