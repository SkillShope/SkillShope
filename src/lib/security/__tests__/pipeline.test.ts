import { describe, it, expect, vi } from "vitest";
import { runSecurityPipeline, computeScore, determineStatus } from "../index";
import type { CheckResult } from "../types";

describe("pipeline", () => {
  describe("computeScore", () => {
    it("returns 100 for all passes", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "pass", severity: "info", message: "ok" },
        { name: "b", status: "pass", severity: "info", message: "ok" },
      ];
      expect(computeScore(checks)).toBe(100);
    });

    it("returns 0 for a critical failure", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "fail", severity: "critical", message: "bad" },
        { name: "b", status: "pass", severity: "info", message: "ok" },
      ];
      expect(computeScore(checks)).toBe(0);
    });

    it("deducts for high severity failures", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "fail", severity: "high", message: "bad" },
        { name: "b", status: "pass", severity: "info", message: "ok" },
      ];
      const score = computeScore(checks);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    it("deducts less for warnings than failures", () => {
      const withWarn: CheckResult[] = [
        { name: "a", status: "warn", severity: "medium", message: "meh" },
      ];
      const withFail: CheckResult[] = [
        { name: "a", status: "fail", severity: "medium", message: "bad" },
      ];
      expect(computeScore(withWarn)).toBeGreaterThan(computeScore(withFail));
    });
  });

  describe("determineStatus", () => {
    it("approves when all pass", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "pass", severity: "info", message: "ok" },
      ];
      expect(determineStatus(checks)).toBe("approved");
    });

    it("rejects on critical failure", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "fail", severity: "critical", message: "bad" },
      ];
      expect(determineStatus(checks)).toBe("rejected");
    });

    it("flags on high failure", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "fail", severity: "high", message: "bad" },
      ];
      expect(determineStatus(checks)).toBe("flagged");
    });

    it("approves with warnings only", () => {
      const checks: CheckResult[] = [
        { name: "a", status: "warn", severity: "medium", message: "meh" },
        { name: "b", status: "pass", severity: "info", message: "ok" },
      ];
      expect(determineStatus(checks)).toBe("approved");
    });
  });
});
