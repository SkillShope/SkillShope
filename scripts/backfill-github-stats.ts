import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.skill.findMany({
    where: { sourceType: "github", sourceUrl: { not: "" } },
    select: { id: true, name: true, sourceUrl: true },
  });

  console.log(`Fetching GitHub stats for ${skills.length} skills...\n`);

  let updated = 0;

  for (const skill of skills) {
    const match = skill.sourceUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) continue;

    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}`;

    try {
      const res = await fetch(apiUrl, {
        headers: { "User-Agent": "SkillShope-Stats" },
      });

      if (!res.ok) {
        console.log(`  SKIP: ${skill.name} (${res.status})`);
        continue;
      }

      const data = await res.json();

      await prisma.skill.update({
        where: { id: skill.id },
        data: {
          githubStars: data.stargazers_count || 0,
          githubForks: data.forks_count || 0,
          lastUpdated: data.pushed_at ? new Date(data.pushed_at) : null,
        },
      });

      console.log(`  ✓ ${skill.name} — ${data.stargazers_count} stars, ${data.forks_count} forks`);
      updated++;

      // Rate limit: GitHub allows 60 req/hour unauthenticated
      await new Promise((r) => setTimeout(r, 1100));
    } catch {
      console.log(`  ERR: ${skill.name}`);
    }
  }

  console.log(`\nDone. Updated ${updated} of ${skills.length} skills.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
