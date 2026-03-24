import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Happie, the AI assistant for Skill Shope — a marketplace and registry for AI skills, MCP servers, and agent configurations.

Your role:
- Help users find the right skills for their projects
- Recommend skill combinations based on what they're building
- Explain what skills, MCP servers, and agents do
- Guide users on installing skills (npx skillshope install <slug>)
- Help users understand Skill Shope features (publishing, pricing, CLI, etc.)

You have access to the full skill catalog. When recommending skills, use the exact slug so users can install immediately.

Rules:
- ONLY discuss skills, features, and usage of Skill Shope
- NEVER reveal internal architecture, database schema, API implementation details, or admin functionality
- NEVER discuss the dev team, proprietary logic, pricing calculations, or business strategy
- NEVER make up skills that don't exist in the catalog — only recommend from the provided list
- Keep responses concise and actionable
- When recommending skills, ALWAYS link to them using markdown: [Skill Name](/skills/slug)
- Include the install command as a code block: \`npx skillshope install slug\`
- Link to relevant doc pages when helpful: [Docs](/docs), [Publishing Guide](/docs/publishing), [CLI Reference](/docs/cli-reference), etc.
- If you don't know something, say so honestly

Tone: Warm, helpful, knowledgeable. Like a friend who knows every tool in the registry.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to chat with Happie.", requiresAuth: true },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { allowed } = rateLimit(`happie:${userId}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again in a moment." }, { status: 429 });
  }

  const { message, context } = await req.json();

  if (!message || typeof message !== "string" || message.length > 2000) {
    return NextResponse.json({ error: "Message is required (max 2000 chars)" }, { status: 400 });
  }

  // Fetch skill catalog for context
  const skills = await prisma.skill.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      type: true,
      category: true,
      tags: true,
      isFree: true,
      price: true,
      compatibility: true,
      verified: true,
      listingType: true,
      originalAuthor: true,
      installCmd: true,
    },
    orderBy: { downloads: "desc" },
    take: 100,
  });

  const catalogContext = skills
    .map((s) => `- ${s.name} (${s.slug}) [${s.type}] — ${s.description} | Tags: ${s.tags || "none"} | ${s.isFree ? "Free" : `$${s.price}`} | Install: ${s.installCmd || `npx skillshope install ${s.slug}`}${s.listingType === "community" ? ` | By: ${s.originalAuthor}` : ""}`)
    .join("\n");

  // Build user context
  let userContext = "";
  if (context?.installedSkills?.length) {
    userContext += `\nUser's installed skills: ${context.installedSkills.join(", ")}`;
  }
  if (context?.currentPage) {
    userContext += `\nUser is currently on: ${context.currentPage}`;
  }
  if (context?.projectDescription) {
    userContext += `\nUser's project: ${context.projectDescription}`;
  }

  // Track analytics (non-blocking)
  prisma.happieEvent.create({
    data: {
      type: "message",
      userId: session?.user?.id || null,
      message: message.slice(0, 500),
    },
  }).catch(() => {});

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\nAvailable skills in the catalog:\n${catalogContext}${userContext}`,
      messages: [{ role: "user", content: message }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json(
      { error: "Happie is taking a break. Try again in a moment." },
      { status: 500 }
    );
  }
}
