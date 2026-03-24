export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type CheckStatus = "pass" | "warn" | "fail";

export type CheckResult = {
  name: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  details?: string;
};

export type SecurityReport = {
  skillId: string;
  status: "approved" | "flagged" | "rejected";
  checks: CheckResult[];
  score: number; // 0-100
  createdAt: Date;
};

export type SkillInput = {
  id: string;
  slug: string;
  name: string;
  sourceUrl: string;
  sourceType: string;
  content?: string; // SKILL.md or other file content
  installCmd?: string;
};
