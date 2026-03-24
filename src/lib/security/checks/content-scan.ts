import { ALL_PATTERNS } from "../patterns";
import type { CheckResult, CheckStatus } from "../types";

// Scan content for malicious patterns — no external APIs, no tokens
export function scanContent(content: string): CheckResult[] {
  if (!content || content.trim() === "") return [];

  const results: CheckResult[] = [];

  for (const pattern of ALL_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;

    if (pattern.regex.test(content)) {
      const status: CheckStatus =
        pattern.severity === "critical" ? "fail" :
        pattern.severity === "high" ? "warn" :
        "warn";

      results.push({
        name: pattern.name,
        status,
        severity: pattern.severity,
        message: pattern.description,
      });
    }
  }

  return results;
}
