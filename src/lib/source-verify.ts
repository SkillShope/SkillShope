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

// Verify any URL is reachable
async function verifyUrl(url: string): Promise<VerifyResult> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });

    if (res.ok) {
      return { status: "valid", details: `URL is reachable (${res.status})` };
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
