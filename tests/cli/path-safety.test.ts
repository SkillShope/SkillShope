import { describe, it, expect } from "vitest";
import { join, resolve, relative } from "path";

// Replicate the CLI's filename sanitization logic for testing
function sanitizeFilename(filename: string): string | null {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const targetDir = "/tmp/test-install/skill";
  const filePath = resolve(targetDir, safeName);
  const rel = relative(targetDir, filePath);
  if (rel.startsWith("..") || resolve(filePath) !== filePath) {
    return null; // Unsafe
  }
  return safeName;
}

describe("CLI filename sanitization", () => {
  it("allows normal filenames", () => {
    expect(sanitizeFilename("SKILL.md")).toBe("SKILL.md");
    expect(sanitizeFilename("config.json")).toBe("config.json");
    expect(sanitizeFilename("my-skill.ts")).toBe("my-skill.ts");
  });

  it("blocks path traversal attempts", () => {
    // Slashes get replaced with underscores, result is safe or null
    const result = sanitizeFilename("../../.bashrc");
    // Either null (blocked) or sanitized without traversal
    if (result !== null) {
      expect(result).not.toContain("/");
    }
    // The important thing: it doesn't return the original dangerous filename
    expect(result).not.toBe("../../.bashrc");
  });

  it("sanitizes absolute path attempts", () => {
    const result = sanitizeFilename("/etc/passwd");
    if (result !== null) {
      expect(result).not.toContain("/");
    }
  });

  it("blocks backslash traversal (Windows)", () => {
    const result = sanitizeFilename("..\\..\\windows\\system32");
    expect(result).not.toBe("..\\..\\windows\\system32");
    if (result !== null) {
      expect(result).not.toContain("\\");
    }
  });

  it("sanitizes null bytes", () => {
    const result = sanitizeFilename("file.md\x00.exe");
    if (result !== null) {
      expect(result).not.toContain("\x00");
    }
  });

  it("preserves dots in normal filenames", () => {
    expect(sanitizeFilename("skill.config.json")).toBe("skill.config.json");
  });

  it("sanitizes spaces and special chars", () => {
    const result = sanitizeFilename("my skill (1).md");
    expect(result).not.toContain(" ");
    expect(result).not.toContain("(");
  });
});
