// Happie: Generate a personal SKILL.md based on conversation context
// POST /api/happie/generate-skill

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Happie, the AI assistant for Skill Shope. Your task is to generate a personal SKILL.md file based on a conversation about a user's project.

Generate a complete, production-ready SKILL.md that:
1. Has proper YAML frontmatter with name and description
2. Contains specific, actionable guidance tailored to the user's project
3. References relevant tools, patterns, and best practices
4. Includes sections organized by topic (setup, workflow, tools, etc.)
5. Is immediately usable — the user should be able to drop this into their project

Output ONLY the SKILL.md content — no explanation, no markdown code fences wrapping it. Just the raw skill file starting with --- frontmatter.`;

export async function POST(req: NextRequest) {
  const session = await auth();

  // Require auth for skill generation
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in required to generate a personal skill.", requiresAuth: true },
      { status: 401 }
    );
  }

  const { allowed } = rateLimit(`happie-gen:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { messages, projectName } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Conversation context required" }, { status: 400 });
  }

  // Track analytics
  prisma.happieEvent.create({
    data: { type: "generate-skill", userId: session.user.id },
  }).catch(() => {});

  // Get skill catalog for context
  const skills = await prisma.skill.findMany({
    select: { slug: true, name: true, description: true, type: true, installCmd: true },
    orderBy: { downloads: "desc" },
    take: 50,
  });

  const catalogBrief = skills
    .map((s) => `${s.name} (${s.slug}): ${s.description}`)
    .join("\n");

  // Build conversation summary for context
  const conversationContext = messages
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `${SYSTEM_PROMPT}\n\nAvailable skills on Skill Shope:\n${catalogBrief}\n\nProject name: ${projectName || "My Project"}`,
      messages: [
        {
          role: "user",
          content: `Based on this conversation, generate a personal SKILL.md for my project:\n\n${conversationContext}`,
        },
      ],
    });

    const content = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ skill: content });
  } catch {
    return NextResponse.json({ error: "Failed to generate skill" }, { status: 500 });
  }
}
