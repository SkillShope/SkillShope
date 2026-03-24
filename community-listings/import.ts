import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  // Find the Skill Shope publisher account
  const publisher = await prisma.user.findUnique({
    where: { email: "publisher@skillshope.com" },
  });

  if (!publisher) {
    console.error("Skill Shope publisher account not found");
    process.exit(1);
  }

  console.log(`Publishing as: ${publisher.name} (${publisher.id})\n`);

  const dir = join(__dirname);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  let total = 0;
  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const listings = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    console.log(`Processing ${file} (${listings.length} listings)...`);

    for (const listing of listings) {
      total++;
      const slug = listing.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Skip if already exists
      const existing = await prisma.skill.findUnique({ where: { slug } });
      if (existing) {
        console.log(`  SKIP: ${listing.name} (${slug}) — already exists`);
        skipped++;
        continue;
      }

      await prisma.skill.create({
        data: {
          slug,
          name: listing.name,
          description: listing.description,
          category: listing.category || "productivity",
          type: listing.type || "skill",
          price: 0,
          isFree: true,
          installCmd: listing.installCmd || null,
          sourceUrl: listing.sourceUrl || "",
          sourceType: listing.sourceType || "github",
          compatibility: listing.compatibility || "claude-code",
          tags: listing.tags || null,
          listingType: "community",
          originalAuthor: listing.originalAuthor || null,
          originalUrl: listing.originalUrl || null,
          authorId: publisher.id,
        },
      });

      console.log(`  OK: ${listing.name} (${slug})`);
      created++;
    }
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped, ${total} total.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
