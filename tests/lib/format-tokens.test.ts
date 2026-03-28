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
