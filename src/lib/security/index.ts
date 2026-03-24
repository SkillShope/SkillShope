import type { CheckResult, SecurityReport, SkillInput } from "./types";
import { scanContent } from "./checks/content-scan";
import { checkSource } from "./checks/source-check";

// Score deductions by severity + status
const DEDUCTIONS: Record<string, Record<string, number>> = {
  critical: { fail: 100, warn: 50 },
  high: { fail: 40, warn: 20 },
  medium: { fail: 20, warn: 10 },
  low: { fail: 5, warn: 2 },
  info: { fail: 0, warn: 0 },
};

export function computeScore(checks: CheckResult[]): number {
  let score = 100;

  for (const check of checks) {
    if (check.status === "pass") continue;
    const deduction = DEDUCTIONS[check.severity]?.[check.status] || 0;
    score -= deduction;
  }

  return Math.max(0, Math.min(100, score));
}

export function determineStatus(
  checks: CheckResult[]
): "approved" | "flagged" | "rejected" {
  // Any critical failure = rejected
  if (checks.some((c) => c.status === "fail" && c.severity === "critical")) {
    return "rejected";
  }

  // Any high failure = flagged for review
  if (checks.some((c) => c.status === "fail" && c.severity === "high")) {
    return "flagged";
  }

  // Medium failures = flagged
  if (checks.some((c) => c.status === "fail" && c.severity === "medium")) {
    return "flagged";
  }

  // Warnings only = approved (with notes)
  return "approved";
}

export async function runSecurityPipeline(
  skill: SkillInput
): Promise<SecurityReport> {
  const checks: CheckResult[] = [];

  // 1. Content scan (synchronous, no external calls)
  if (skill.content) {
    checks.push(...scanContent(skill.content));
  }

  // 2. Source verification (async, external APIs)
  if (skill.sourceUrl) {
    const sourceResults = await checkSource(skill.sourceUrl, skill.sourceType);
    checks.push(...sourceResults);
  }

  // 3. Install command check
  if (skill.installCmd) {
    const cmdChecks = scanContent(skill.installCmd);
    checks.push(
      ...cmdChecks.map((c) => ({
        ...c,
        name: `cmd-${c.name}`,
        message: `Install command: ${c.message}`,
      }))
    );
  }

  const score = computeScore(checks);
  const status = determineStatus(checks);

  return {
    skillId: skill.id,
    status,
    checks,
    score,
    createdAt: new Date(),
  };
}
