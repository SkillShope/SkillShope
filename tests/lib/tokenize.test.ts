import { describe, it, expect, vi, beforeEach } from "vitest";
import { countSkillTokens } from "@/lib/tokenize";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  const mockCountTokens = vi.fn();
  return {
    default: class {
      messages = { countTokens: mockCountTokens };
    },
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
