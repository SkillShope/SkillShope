import { describe, it, expect } from "vitest";
import { sanitize, isValidUrl, isValidSlug, validate } from "@/lib/validation";

describe("sanitize", () => {
  it("strips HTML tags", () => {
    expect(sanitize("<script>alert(1)</script>hello")).toBe("alert(1)hello");
  });

  it("strips malformed tags (no closing >)", () => {
    expect(sanitize("<img src=x onerror=alert(1)//")).toBe("");
  });

  it("strips event handlers", () => {
    expect(sanitize('text onerror=alert(1) more')).toBe("text alert(1) more");
    expect(sanitize("onload=steal() content")).toBe("steal() content");
  });

  it("strips javascript: protocol", () => {
    expect(sanitize("javascript:alert(1)")).toBe("alert(1)");
    expect(sanitize("JAVASCRIPT:void(0)")).toBe("void(0)");
  });

  it("preserves normal text", () => {
    expect(sanitize("Hello, world!")).toBe("Hello, world!");
    expect(sanitize("Code review with AI")).toBe("Code review with AI");
  });

  it("trims whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });
});

describe("isValidUrl", () => {
  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isValidUrl("https://github.com/user/repo")).toBe(true);
  });

  it("rejects javascript: URLs", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URLs", () => {
    expect(isValidUrl("data:text/html,<script>")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("rejects strings without protocol", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase alphanumeric with hyphens", () => {
    expect(isValidSlug("code-reviewer-pro")).toBe(true);
    expect(isValidSlug("skill123")).toBe(true);
  });

  it("rejects uppercase", () => {
    expect(isValidSlug("Code-Reviewer")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(isValidSlug("skill@name")).toBe(false);
    expect(isValidSlug("skill/name")).toBe(false);
  });

  it("rejects leading/trailing hyphens", () => {
    expect(isValidSlug("-bad-slug")).toBe(false);
    expect(isValidSlug("bad-slug-")).toBe(false);
  });
});

describe("validate", () => {
  it("returns errors for missing required fields", () => {
    const errors = validate([
      { field: "name", value: "", required: true },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("returns errors for fields below minLength", () => {
    const errors = validate([
      { field: "name", value: "ab", required: true, minLength: 3 },
    ]);
    expect(errors).toHaveLength(1);
  });

  it("returns errors for fields above maxLength", () => {
    const errors = validate([
      { field: "name", value: "a".repeat(101), maxLength: 100 },
    ]);
    expect(errors).toHaveLength(1);
  });

  it("returns no errors for valid input", () => {
    const errors = validate([
      { field: "name", value: "Valid Name", required: true, minLength: 2, maxLength: 100 },
    ]);
    expect(errors).toHaveLength(0);
  });
});
