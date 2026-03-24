import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Demo Author",
      email: "demo@skillshope.dev",
      image: null,
      bio: "AI tooling enthusiast and open source contributor.",
      publisherVerified: true,
      githubUsername: "demoauthor",
    },
  });

  const skills = [
    {
      slug: "code-reviewer",
      name: "Code Reviewer",
      description: "Automated code review with best-practice suggestions and security checks.",
      sourceUrl: "https://github.com/demoauthor/code-reviewer",
      sourceType: "github",
      longDescription:
        "A comprehensive code review skill that analyzes your codebase for common issues, security vulnerabilities, and style inconsistencies. Works with JavaScript, TypeScript, Python, and Go.\n\nIncludes configurable rulesets, inline suggestions, and summary reports.",
      category: "developer-tools",
      type: "skill",
      isFree: true,
      installCmd: "claude skill install code-reviewer",
      downloads: 2340,
      rating: 4.7,
      reviewCount: 18,
      compatibility: "claude-code,cursor",
      tags: "code-review,security,linting",
      featured: true,
      verified: true,
    },
    {
      slug: "postgres-mcp",
      name: "Postgres MCP Server",
      description: "Query and manage PostgreSQL databases directly from your AI assistant.",
      sourceUrl: "https://www.npmjs.com/package/@skillshope/postgres-mcp",
      sourceType: "npm",
      longDescription:
        "Connect your AI assistant to PostgreSQL databases for schema exploration, query execution, and data analysis. Supports read-only and read-write modes with configurable permissions.\n\nPerfect for debugging, data exploration, and generating reports.",
      category: "databases",
      type: "mcp-server",
      isFree: true,
      installCmd: "npx @skillshope/postgres-mcp",
      downloads: 5120,
      rating: 4.9,
      reviewCount: 42,
      compatibility: "claude-code,codex,cursor",
      tags: "postgres,database,sql,mcp",
      featured: true,
      verified: true,
    },
    {
      slug: "deploy-agent",
      name: "Deploy Agent",
      description: "Autonomous deployment agent that handles CI/CD pipelines, rollbacks, and monitoring.",
      sourceUrl: "https://github.com/demoauthor/deploy-agent",
      sourceType: "github",
      longDescription:
        "A fully autonomous agent that manages your deployment pipeline. Monitors build status, runs health checks, and can automatically roll back failed deployments.\n\nSupports AWS, GCP, Vercel, and Fly.io out of the box.",
      category: "devops",
      type: "agent",
      isFree: false,
      price: 9.99,
      installCmd: "claude agent install deploy-agent",
      downloads: 870,
      rating: 4.5,
      reviewCount: 11,
      compatibility: "claude-code",
      tags: "deploy,ci-cd,devops,agent",
      featured: false,
      verified: true,
    },
    {
      slug: "api-docs-generator",
      name: "API Docs Generator",
      description: "Generate beautiful API documentation from your codebase automatically.",
      sourceUrl: "https://github.com/demoauthor/api-docs-generator",
      sourceType: "github",
      category: "documentation",
      type: "skill",
      isFree: true,
      installCmd: "claude skill install api-docs-generator",
      downloads: 1560,
      rating: 4.3,
      reviewCount: 9,
      compatibility: "claude-code,cursor",
      tags: "docs,api,openapi",
      featured: false,
      verified: false,
    },
    {
      slug: "figma-mcp",
      name: "Figma MCP Server",
      description: "Bridge between Figma designs and your AI coding assistant.",
      sourceUrl: "https://www.npmjs.com/package/@skillshope/figma-mcp",
      sourceType: "npm",
      longDescription:
        "Extract design tokens, components, and layout information from Figma files. Translates designs into code-ready specifications.\n\nSupports React, Vue, and Svelte component generation.",
      category: "design",
      type: "mcp-server",
      isFree: false,
      price: 4.99,
      installCmd: "npx @skillshope/figma-mcp",
      downloads: 3200,
      rating: 4.6,
      reviewCount: 27,
      compatibility: "claude-code,codex,cursor",
      tags: "figma,design,ui,mcp",
      featured: true,
      verified: true,
    },
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        ...skill,
        authorId: user.id,
      },
    });
  }

  console.log(`Seeded ${skills.length} skills with 1 author.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
