import { PrismaClient } from "@prisma/client";
import { runSecurityPipeline } from "../src/lib/security";
import type { SkillInput } from "../src/lib/security/types";

const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.skill.findMany({
    include: { files: { select: { content: true } } },
  });

  console.log(`Scanning ${skills.length} skills...\n`);

  let approved = 0;
  let flagged = 0;
  let rejected = 0;

  for (const skill of skills) {
    const content = skill.files.map((f) => f.content).join("\n\n");

    const input: SkillInput = {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      sourceUrl: skill.sourceUrl,
      sourceType: skill.sourceType,
      content: content || undefined,
      installCmd: skill.installCmd || undefined,
    };

    const report = await runSecurityPipeline(input);

    await prisma.securityReport.create({
      data: {
        skillId: skill.id,
        status: report.status,
        score: report.score,
        checks: JSON.stringify(report.checks),
      },
    });

    await prisma.skill.update({
      where: { id: skill.id },
      data: {
        reviewStatus: report.status,
        securityScore: report.score,
      },
    });

    const icon = report.status === "approved" ? "✓" : report.status === "flagged" ? "⚠" : "✗";
    console.log(`  ${icon} ${skill.name} — ${report.status} (score: ${report.score})`);

    if (report.status === "approved") approved++;
    else if (report.status === "flagged") flagged++;
    else rejected++;

    // Print failures/warnings
    for (const check of report.checks) {
      if (check.status !== "pass") {
        console.log(`    ${check.status === "fail" ? "FAIL" : "WARN"}: ${check.message}`);
      }
    }
  }

  console.log(`\nDone. ${approved} approved, ${flagged} flagged, ${rejected} rejected.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
