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
