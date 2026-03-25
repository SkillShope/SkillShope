import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bundles = [
  {
    name: "Launch a SaaS",
    description: "Everything you need to build and ship a SaaS product — from frontend to deployment to SEO.",
    longDescription: "A complete toolkit for solo founders and small teams building SaaS products. Covers the frontend design system, database connectivity, deployment automation, SEO optimization, and documentation generation. Install all tools and start shipping.",
    category: "general",
    skillSlugs: ["frontend-design", "claude-seo", "superpowers", "spec-kit", "doc-co-authoring"],
  },
  {
    name: "Data & Analytics Stack",
    description: "Query databases, process spreadsheets, generate reports — all from natural language.",
    longDescription: "Turn your AI assistant into a data powerhouse. Query Postgres with natural language, manipulate Excel files, process PDFs, and build dashboards — all without writing SQL or wrestling with spreadsheet formulas.",
    category: "data-pipeline",
    skillSlugs: ["vanna-ai", "xlsx", "excel-mcp-server", "pdf-processing", "web-artifacts-builder"],
  },
  {
    name: "Content Creator Kit",
    description: "Write, design, and publish content across every format — docs, slides, graphics, and video.",
    longDescription: "A full creative suite for content teams. Generate slide decks, create social graphics, produce Word documents with tracked changes, and even generate video with Remotion. Pair with the Brand Guidelines skill to keep everything on-brand.",
    category: "productivity",
    skillSlugs: ["docx", "pptx", "canvas-design", "brand-guidelines", "remotion-best-practices"],
  },
  {
    name: "DevOps Essentials",
    description: "Automate deployments, monitor systems, and orchestrate workflows from your terminal.",
    longDescription: "Set up CI/CD pipelines, automate routine operations, monitor your infrastructure, and respond to incidents — all powered by AI. From workflow automation with n8n to self-hosted monitoring with Huginn.",
    category: "devops",
    skillSlugs: ["n8n", "huginn", "superpowers", "systematic-debugging", "context-optimization"],
  },
  {
    name: "AI Agent Builder",
    description: "Build, orchestrate, and deploy autonomous AI agents with the best open-source frameworks.",
    longDescription: "Everything you need to build production AI agents. Multi-agent orchestration with LangGraph, team-based agents with CrewAI, visual pipeline design with Langflow, and autonomous research with GPT Researcher. Run models locally with Ollama for privacy.",
    category: "developer-tools",
    skillSlugs: ["langgraph", "crewai", "langflow", "gpt-researcher", "ollama"],
  },
  {
    name: "Marketing Powerhouse",
    description: "SEO audits, copywriting, email sequences, and growth marketing — all AI-powered.",
    longDescription: "A comprehensive marketing toolkit. Run full-site SEO audits, generate high-converting copy, create email sequences, and execute growth strategies. Includes Corey Haines' battle-tested marketing skills plus Claude SEO for technical optimization.",
    category: "productivity",
    skillSlugs: ["marketing-skills", "claude-seo", "brand-guidelines", "canvas-design", "doc-co-authoring"],
  },
];

async function main() {
  const publisher = await prisma.user.findUnique({
    where: { email: "publisher@skillshope.com" },
  });

  if (!publisher) {
    console.error("Skill Shope publisher account not found");
    process.exit(1);
  }

  console.log(`Creating bundles as ${publisher.name}...\n`);

  for (const b of bundles) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.bundle.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  SKIP: ${b.name} (already exists)`);
      continue;
    }

    const bundle = await prisma.bundle.create({
      data: {
        slug,
        name: b.name,
        description: b.description,
        longDescription: b.longDescription,
        category: b.category,
        isFree: true,
        price: 0,
        authorId: publisher.id,
      },
    });

    let linked = 0;
    for (const skillSlug of b.skillSlugs) {
      const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
      if (skill) {
        await prisma.bundleSkill.create({
          data: { bundleId: bundle.id, skillId: skill.id },
        });
        linked++;
      }
    }

    console.log(`  ✓ ${b.name} — ${linked} tools`);
  }

  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
