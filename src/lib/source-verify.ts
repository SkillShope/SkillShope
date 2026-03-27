import { prisma } from "./prisma";

type VerifyResult = {
  status: "valid" | "invalid" | "error";
  details: string;
};

// Verify a GitHub repo is accessible, public, and has content
async function verifyGitHub(url: string): Promise<VerifyResult> {
  // Extract owner/repo from URL variants:
  // https://github.com/owner/repo
  // https://github.com/owner/repo/tree/branch/path
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return { status: "invalid", details: "Could not parse GitHub URL" };
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}`;

  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "SkillShope-SourceVerify" },
  });

  if (res.status === 404) {
    return { status: "invalid", details: "Repository not found or is private" };
  }

  if (!res.ok) {
    return { status: "error", details: `GitHub API returned ${res.status}` };
  }

  const data = await res.json();

  if (data.private) {
    return { status: "invalid", details: "Repository is private — must be public" };
  }

  if (data.archived) {
    return { status: "valid", details: "Repository is archived but accessible" };
  }

  return { status: "valid", details: `Public repo: ${data.full_name}, ${data.stargazers_count} stars` };
}

// Verify an npm package exists and is published
async function verifyNpm(url: string): Promise<VerifyResult> {
  // Extract package name from URL variants:
  // https://www.npmjs.com/package/@scope/name
  // https://www.npmjs.com/package/name
  const match = url.match(/npmjs\.com\/package\/((?:@[^/]+\/)?[^/]+)/);
  if (!match) {
    return { status: "invalid", details: "Could not parse npm package URL" };
  }

  const packageName = match[1];
  const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

  const res = await fetch(apiUrl);

  if (res.status === 404) {
    return { status: "invalid", details: "Package not found on npm" };
  }

  if (!res.ok) {
    return { status: "error", details: `npm registry returned ${res.status}` };
  }

  const data = await res.json();
  const latest = data["dist-tags"]?.latest;

  return {
    status: "valid",
    details: `Published on npm, latest version: ${latest || "unknown"}`,
  };
}

// Block SSRF: reject private IPs, localhost, and cloud metadata endpoints
function isPrivateUrl(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return true; // Malformed URL — block it
  }

  // Block localhost variants
  if (hostname === "localhost" || hostname === "[::1]") return true;

  // Block cloud metadata endpoints
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") return true;

  // Block private IP ranges
  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
  }

  return false;
}

// Verify any URL is reachable
async function verifyUrl(url: string): Promise<VerifyResult> {
  if (isPrivateUrl(url)) {
    return { status: "invalid", details: "URL points to a private or reserved address" };
  }

  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" });

    if (res.ok) {
      return { status: "valid", details: `URL is reachable (${res.status})` };
    }

    // For redirects, validate the target before following
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location && isPrivateUrl(location)) {
        return { status: "invalid", details: "URL redirects to a private address" };
      }
      return { status: "valid", details: `URL is reachable (redirects to ${location || "unknown"})` };
    }

    return { status: "invalid", details: `URL returned ${res.status}` };
  } catch {
    return { status: "error", details: "URL is unreachable" };
  }
}

// Main verification function — dispatches based on source type
export async function verifySource(
  sourceUrl: string,
  sourceType: string
): Promise<VerifyResult> {
  if (!sourceUrl) {
    return { status: "invalid", details: "No source URL provided" };
  }

  try {
    switch (sourceType) {
      case "github":
        return await verifyGitHub(sourceUrl);
      case "npm":
        return await verifyNpm(sourceUrl);
      default:
        return await verifyUrl(sourceUrl);
    }
  } catch {
    return { status: "error", details: "Verification failed unexpectedly" };
  }
}

// Verify a skill by ID and update the database
export async function verifySkillSource(skillId: string): Promise<VerifyResult> {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { sourceUrl: true, sourceType: true },
  });

  if (!skill) {
    return { status: "error", details: "Skill not found" };
  }

  const result = await verifySource(skill.sourceUrl, skill.sourceType);

  await prisma.skill.update({
    where: { id: skillId },
    data: {
      sourceStatus: result.status,
      sourceCheckedAt: new Date(),
    },
  });

  return result;
}
