import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-allow-${Date.now()}`;
    const r1 = rateLimit(key, 3, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, 3, 60_000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(key, 3, 60_000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding limit", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);

    const r3 = rateLimit(key, 2, 60_000);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${Date.now()}`;
    // Use a 1ms window so it expires immediately
    rateLimit(key, 1, 1);

    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) {} // busy wait 5ms

    const r = rateLimit(key, 1, 1);
    expect(r.allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    const key1 = `test-ind1-${Date.now()}`;
    const key2 = `test-ind2-${Date.now()}`;

    rateLimit(key1, 1, 60_000);
    const r1 = rateLimit(key1, 1, 60_000);
    expect(r1.allowed).toBe(false);

    const r2 = rateLimit(key2, 1, 60_000);
    expect(r2.allowed).toBe(true);
  });
});
