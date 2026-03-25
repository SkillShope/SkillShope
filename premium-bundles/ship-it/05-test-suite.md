---
name: ship-it-tests
description: >-
  Generate a production test suite for your app. Sets up vitest, writes unit tests
  for utilities, integration tests for API routes, and component tests. Test-driven
  approach with patterns specific to Next.js + Prisma apps.
---

# Test Suite Generator

Set up testing and write your first test suite. Tests give you confidence to ship fast.

## Step 1: Install vitest

```bash
npm install -D vitest @types/node
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

Add to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Exclude test files from `tsconfig.json`:
```json
"exclude": ["node_modules", "**/__tests__/**", "**/*.test.ts"]
```

## Step 2: Test Your Validation Layer

Create `src/lib/__tests__/validation.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { sanitize, isValidEmail, isValidSlug } from "../validation";

describe("sanitize", () => {
  it("strips HTML tags", () => {
    expect(sanitize("<script>alert('xss')</script>hello")).toBe("hello");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });

  it("handles empty strings", () => {
    expect(sanitize("")).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@no-user.com")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("my-cool-skill")).toBe(true);
    expect(isValidSlug("skill123")).toBe(true);
  });

  it("rejects invalid slugs", () => {
    expect(isValidSlug("Has Spaces")).toBe(false);
    expect(isValidSlug("UPPERCASE")).toBe(false);
    expect(isValidSlug("-starts-with-dash")).toBe(false);
  });
});
```

Run: `npm test` — all should pass.

## Step 3: Test Your API Routes

For API routes, test the logic functions, not the HTTP layer. Extract business logic into testable functions.

**Pattern: Extract and test**

Instead of testing the route handler directly:
```typescript
// src/lib/skills.ts — extracted business logic
export function validateSkillInput(body: unknown) {
  const errors = [];
  // validation logic
  return errors;
}
```

```typescript
// src/lib/__tests__/skills.test.ts
describe("validateSkillInput", () => {
  it("requires a name", () => {
    const errors = validateSkillInput({ description: "test" });
    expect(errors.some(e => e.field === "name")).toBe(true);
  });

  it("requires description min length", () => {
    const errors = validateSkillInput({ name: "test", description: "hi" });
    expect(errors.some(e => e.field === "description")).toBe(true);
  });

  it("passes valid input", () => {
    const errors = validateSkillInput({
      name: "My Skill",
      description: "A valid description that is long enough",
      category: "productivity",
    });
    expect(errors.length).toBe(0);
  });
});
```

## Step 4: Test Security Logic

```typescript
// src/lib/__tests__/rate-limit.test.ts
import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}`;
    const result = rateLimit(key, 5, 60000);
    expect(result.allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60000);
    }
    const result = rateLimit(key, 5, 60000);
    expect(result.allowed).toBe(false);
  });
});
```

## Step 5: Test Patterns for Common Cases

**Testing with mocks (external APIs):**
```typescript
import { vi } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

it("handles API failure gracefully", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
  const result = await myFunction();
  expect(result.error).toBeDefined();
});
```

**Testing edge cases:**
```typescript
describe("edge cases", () => {
  it("handles undefined input", () => { ... });
  it("handles empty string", () => { ... });
  it("handles very long input", () => { ... });
  it("handles special characters", () => { ... });
  it("handles concurrent requests", () => { ... });
});
```

## Step 6: What NOT to Test

- Don't test Prisma queries directly — trust the ORM
- Don't test Next.js routing — trust the framework
- Don't test third-party libraries — trust the maintainers
- Don't test UI rendering without a specific reason

**DO test:**
- Your validation logic
- Your business logic
- Your security checks
- Your data transformations
- Edge cases in your code

## Step 7: CI Integration

Add to your PR workflow. Tests run automatically on every push:

**GitHub Actions (`.github/workflows/test.yml`):**
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
```

## Checkpoint

- [ ] `npm test` passes all tests
- [ ] Validation functions have full coverage
- [ ] Rate limiting tested for both allow and block cases
- [ ] Business logic extracted and tested independently
- [ ] Tests run in under 5 seconds
