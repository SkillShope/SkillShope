import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Extract owner/repo from various GitHub URL formats
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// Try to fetch a file from the repo (checks multiple paths)
async function fetchRepoFile(
  owner: string,
  repo: string,
  paths: string[],
  headers: Record<string, string>
): Promise<string | null> {
  for (const path of paths) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.content && data.encoding === "base64") {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`github-import:${session.user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "GitHub URL is required" }, { status: 400 });
  }

  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse GitHub URL" }, { status: 400 });
  }

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    "User-Agent": "SkillShope-Import",
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // Fetch repo metadata
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: "Repository not found or is private" },
        { status: 404 }
      );
    }

    const repoData = await repoRes.json();

    // Try to find SKILL.md content
    const skillContent = await fetchRepoFile(owner, repo, [
      "SKILL.md",
      "skill.md",
      "skills/SKILL.md",
      ".claude/skills/SKILL.md",
    ], headers);

    // Try to find README for long description fallback
    const readme = !skillContent
      ? await fetchRepoFile(owner, repo, ["README.md", "readme.md"], headers)
      : null;

    // Map GitHub topics to tags
    const tags = (repoData.topics || []).slice(0, 10).join(", ");

    // Infer category from topics
    const categoryMap: Record<string, string> = {
      testing: "testing",
      test: "testing",
      "code-review": "code-review",
      review: "code-review",
      security: "security",
      devops: "devops",
      "ci-cd": "devops",
      deployment: "deployment",
      documentation: "documentation",
      docs: "documentation",
      database: "database",
      api: "api",
      productivity: "productivity",
      "data-pipeline": "data-pipeline",
    };
    const inferredCategory = (repoData.topics || [])
      .find((t: string) => categoryMap[t]);

    const result = {
      name: repoData.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      description: (repoData.description || "").slice(0, 300),
      longDescription: readme?.slice(0, 5000) || "",
      sourceUrl: repoData.html_url,
      sourceType: "github",
      tags,
      category: inferredCategory ? categoryMap[inferredCategory] : undefined,
      skillContent: skillContent || "",
      githubStars: repoData.stargazers_count,
      githubForks: repoData.forks_count,
      owner: repoData.owner?.login,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repository data" },
      { status: 500 }
    );
  }
}
