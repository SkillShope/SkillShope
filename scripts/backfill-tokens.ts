import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic();

async function main() {
  // Get all skills with content but no token estimate
  const skillFiles = await prisma.skillFile.findMany({
    where: {
      skill: {
        estimatedTokens: null,
        author: { isAdmin: true },
      },
    },
    include: { skill: { select: { id: true, slug: true, name: true } } },
  });

  console.log(`Found ${skillFiles.length} skills to backfill\n`);

  for (const sf of skillFiles) {
    try {
      const result = await anthropic.messages.countTokens({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: sf.content }],
      });

      await prisma.skill.update({
        where: { id: sf.skill.id },
        data: { estimatedTokens: result.input_tokens },
      });

      console.log(`✓ ${sf.skill.name} — ${result.input_tokens} tokens`);
    } catch (err) {
      console.error(`✗ ${sf.skill.name} — failed:`, err);
    }
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
