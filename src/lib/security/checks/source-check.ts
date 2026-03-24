import type { CheckResult } from "../types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function checkSource(
  sourceUrl: string,
  sourceType: string
): Promise<CheckResult[]> {
  if (!sourceUrl) {
    return [{ name: "no-source", status: "warn", severity: "medium", message: "No source URL provided" }];
  }

  switch (sourceType) {
    case "github":
      return checkGitHub(sourceUrl);
    case "npm":
      return checkNpm(sourceUrl);
    default:
      return checkUrl(sourceUrl);
  }
}

async function checkGitHub(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    results.push({ name: "invalid-github-url", status: "fail", severity: "high", message: "Could not parse GitHub URL" });
    return results;
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "SkillShope-Security" },
    });

    if (res.status === 404) {
      results.push({ name: "repo-not-found", status: "fail", severity: "critical", message: "Repository not found or inaccessible" });
      return results;
    }

    if (!res.ok) {
      results.push({ name: "github-api-error", status: "warn", severity: "medium", message: `GitHub API returned ${res.status}` });
      return results;
    }

    const data = await res.json();

    // Private repo — fail
    if (data.private) {
      results.push({ name: "repo-private", status: "fail", severity: "critical", message: "Repository is private" });
    } else {
      results.push({ name: "repo-public", status: "pass", severity: "info", message: "Repository is public" });
    }

    // License check
    if (!data.license) {
      results.push({ name: "no-license", status: "warn", severity: "medium", message: "No license detected — potential legal risk" });
    } else {
      results.push({ name: "has-license", status: "pass", severity: "info", message: `License: ${data.license.spdx_id}` });
    }

    // Owner account age
    if (data.owner?.created_at) {
      const accountAge = Date.now() - new Date(data.owner.created_at).getTime();
      if (accountAge < THIRTY_DAYS_MS) {
        results.push({
          name: "new-account",
          status: "warn",
          severity: "medium",
          message: "Owner account is less than 30 days old",
        });
      } else {
        results.push({ name: "account-age-ok", status: "pass", severity: "info", message: "Owner account is established" });
      }
    }

    // Archived check
    if (data.archived) {
      results.push({ name: "repo-archived", status: "warn", severity: "low", message: "Repository is archived" });
    }

  } catch {
    results.push({ name: "github-error", status: "warn", severity: "medium", message: "Failed to reach GitHub API" });
  }

  return results;
}

async function checkNpm(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const match = url.match(/npmjs\.com\/package\/((?:@[^/]+\/)?[^/]+)/);
  if (!match) {
    results.push({ name: "invalid-npm-url", status: "fail", severity: "high", message: "Could not parse npm URL" });
    return results;
  }

  const packageName = match[1];

  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);

    if (res.status === 404) {
      results.push({ name: "npm-not-found", status: "fail", severity: "critical", message: "Package not found on npm" });
      return results;
    }

    if (!res.ok) {
      results.push({ name: "npm-error", status: "warn", severity: "medium", message: `npm registry returned ${res.status}` });
      return results;
    }

    const data = await res.json();
    results.push({
      name: "npm-exists",
      status: "pass",
      severity: "info",
      message: `Package exists, latest: ${data["dist-tags"]?.latest || "unknown"}`,
    });

  } catch {
    results.push({ name: "npm-error", status: "warn", severity: "medium", message: "Failed to reach npm registry" });
  }

  return results;
}

async function checkUrl(url: string): Promise<CheckResult[]> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.ok) {
      return [{ name: "url-reachable", status: "pass", severity: "info", message: `URL is reachable (${res.status})` }];
    }
    return [{ name: "url-error", status: "fail", severity: "high", message: `URL returned ${res.status}` }];
  } catch {
    return [{ name: "url-unreachable", status: "fail", severity: "high", message: "URL is unreachable" }];
  }
}
