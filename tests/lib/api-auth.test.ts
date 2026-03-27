import { describe, it, expect } from "vitest";
import { hashApiKey, generateApiKey } from "@/lib/api-auth";

describe("generateApiKey", () => {
  it("generates a key starting with sk_", () => {
    const key = generateApiKey();
    expect(key).toMatch(/^sk_[a-f0-9]{64}$/);
  });

  it("generates unique keys each time", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a).not.toBe(b);
  });
});

describe("hashApiKey", () => {
  it("produces a consistent SHA-256 hash", () => {
    const key = "sk_abc123";
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
  });

  it("produces a 64-char hex string", () => {
    const hash = hashApiKey("sk_test");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces different hashes for different keys", () => {
    const hash1 = hashApiKey("sk_key1");
    const hash2 = hashApiKey("sk_key2");
    expect(hash1).not.toBe(hash2);
  });
});
