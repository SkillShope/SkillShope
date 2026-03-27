import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt, isEncrypted } from "@/lib/crypto";

// Set test encryption key — must decode to exactly 32 bytes
beforeAll(() => {
  // crypto.randomBytes(32).toString('base64') = exactly 32 bytes
  process.env.TOKEN_ENCRYPTION_KEY = "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=";
});

describe("encrypt/decrypt", () => {
  it("roundtrips a plaintext string", () => {
    const plaintext = "gho_abc123secrettoken";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plaintext = "same-input";
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b);
    // Both decrypt to same value
    expect(decrypt(a)).toBe(plaintext);
    expect(decrypt(b)).toBe(plaintext);
  });

  it("throws on tampered ciphertext", () => {
    const encrypted = encrypt("secret");
    const tampered = encrypted.slice(0, -2) + "XX";
    expect(() => decrypt(tampered)).toThrow();
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("handles unicode content", () => {
    const plaintext = "token_with_emoji_🔑_and_日本語";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });
});

describe("isEncrypted", () => {
  it("returns false for GitHub OAuth tokens", () => {
    expect(isEncrypted("gho_abc123")).toBe(false);
    expect(isEncrypted("ghu_xyz789")).toBe(false);
    expect(isEncrypted("ghp_token123")).toBe(false);
  });

  it("returns true for encrypted values", () => {
    const encrypted = encrypt("gho_realtoken");
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it("returns false for short strings", () => {
    expect(isEncrypted("short")).toBe(false);
  });
});
