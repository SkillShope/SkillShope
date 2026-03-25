import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const SKILLS = [
  { slug: "ship-it-scaffold", name: "Ship It: Project Scaffold", file: "01-project-scaffold.md", price: 9.99 },
  { slug: "ship-it-database", name: "Ship It: Database Design", file: "02-database-design.md", price: 9.99 },
  { slug: "ship-it-security", name: "Ship It: Auth & Security", file: "03-auth-security.md", price: 9.99 },
  { slug: "ship-it-deploy", name: "Ship It: Deploy Pipeline", file: "04-deploy-pipeline.md", price: 9.99 },
  { slug: "ship-it-tests", name: "Ship It: Test Suite", file: "05-test-suite.md", price: 9.99 },
];

async function main() {
  const publisher = await prisma.user.findUnique({
    where: { email: "publisher@skillshope.com" },
  });

  if (!publisher) {
    console.error("Skill Shope publisher not found");
    process.exit(1);
  }

  const dir = join(__dirname, "../premium-bundles/ship-it");
  const skillIds: string[] = [];

  console.log("Creating Ship It skills...\n");

  for (const s of SKILLS) {
    const existing = await prisma.skill.findUnique({ where: { slug: s.slug } });
    if (existing) {
      console.log(`  SKIP: ${s.name} (exists)`);
      skillIds.push(existing.id);
      continue;
    }

    const content = readFileSync(join(dir, s.file), "utf-8");

    // Extract description from frontmatter
    const descMatch = content.match(/description:\s*>-?\s*\n([\s\S]*?)(?:\n---)/);
    const description = descMatch
      ? descMatch[1].trim().split("\n").map((l) => l.trim()).join(" ").slice(0, 300)
      : `Part of the Ship It bundle — ${s.name}`;

    const skill = await prisma.skill.create({
      data: {
        slug: s.slug,
        name: s.name,
        description,
        category: "developer-tools",
        type: "skill",
        price: s.price,
        isFree: false,
        installCmd: `npx skillshope install ${s.slug}`,
        sourceUrl: "",
        sourceType: "other",
        compatibility: "claude-code,codex,cursor",
        tags: "ship-it,production,next-js,deployment,testing",
        listingType: "original",
        reviewStatus: "approved",
        securityScore: 100,
        authorId: publisher.id,
      },
    });

    // Store the skill content
    await prisma.skillFile.create({
      data: {
        skillId: skill.id,
        filename: "SKILL.md",
        content,
      },
    });

    console.log(`  ✓ ${s.name}`);
    skillIds.push(skill.id);
  }

  // Create the bundle
  const bundleSlug = "ship-it";
  const existingBundle = await prisma.bundle.findUnique({ where: { slug: bundleSlug } });

  if (existingBundle) {
    console.log("\n  SKIP: Ship It bundle (exists)");
  } else {
    const bundle = await prisma.bundle.create({
      data: {
        slug: bundleSlug,
        name: "Ship It",
        description: "Zero to production in one session. Scaffold, database, auth, deploy, and test — a complete guided system for shipping Next.js apps.",
        longDescription: "Ship It is not a collection of reference docs — it's a coordinated system of 5 guided workflows that take you from an empty directory to a deployed, tested, production app.\n\nEach skill builds on the previous one. The Project Scaffold sets up your stack. Database Design structures your data. Auth & Security hardens every endpoint. Deploy Pipeline gets you live. Test Suite gives you confidence to keep shipping.\n\nDesigned for solo founders, small teams, and anyone who wants to stop spending days on boilerplate and start building the thing that matters.",
        category: "developer-tools",
        price: 29.99,
        isFree: false,
        discount: 40,
        featured: true,
        authorId: publisher.id,
      },
    });

    for (const skillId of skillIds) {
      await prisma.bundleSkill.create({
        data: { bundleId: bundle.id, skillId },
      });
    }

    console.log(`\n  ✓ Ship It bundle — $29.99 (40% off $49.95 individual)`);
  }

  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
