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
