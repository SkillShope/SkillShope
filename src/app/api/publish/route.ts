// API-First Publishing
// POST /api/publish — create a skill via API key (for CI/CD pipelines)
// Auth: Bearer sk_... token

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/api-auth";
import { validate, sanitize, isValidUrl, isValidSlug } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { verifySkillSource } from "@/lib/source-verify";

const VALID_TYPES = ["skill", "mcp-server", "agent"];
const VALID_SOURCE_TYPES = ["github", "npm", "other"];

export async function POST(req: NextRequest) {
  const userId = await authenticateApiKey(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { allowed } = rateLimit(`publish:${userId}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();

  // Validate
  const errors = validate([
    { field: "name", value: body.name, required: true, minLength: 2, maxLength: 100 },
    { field: "slug", value: body.slug, required: false, minLength: 2, maxLength: 100 },
    { field: "description", value: body.description, required: true, minLength: 10, maxLength: 300 },
    { field: "category", value: body.category, required: true, maxLength: 50 },
  ]);

  // Auto-generate slug if not provided
  const slug = body.slug || body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!isValidSlug(slug)) {
    errors.push({ field: "slug", message: "slug must be lowercase alphanumeric with hyphens" });
  }

  if (body.sourceUrl && !isValidUrl(body.sourceUrl)) {
    errors.push({ field: "sourceUrl", message: "sourceUrl must be a valid URL" });
  }

  if (body.type && !VALID_TYPES.includes(body.type)) {
    errors.push({ field: "type", message: "type must be skill, mcp-server, or agent" });
  }

  if (body.sourceType && !VALID_SOURCE_TYPES.includes(body.sourceType)) {
    errors.push({ field: "sourceType", message: "sourceType must be github, npm, or other" });
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.skill.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { errors: [{ field: "slug", message: "This slug is already taken" }] },
      { status: 409 }
    );
  }

  const isCommunity = body.listingType === "community";
  const isFree = isCommunity ? true : (body.isFree ?? true);
  const price = isFree ? 0 : Math.max(0.99, Number(body.price) || 0);

  const skill = await prisma.skill.create({
    data: {
      slug,
      name: sanitize(body.name),
      description: sanitize(body.description),
      longDescription: body.longDescription ? sanitize(body.longDescription).slice(0, 5000) : null,
      category: body.category.slice(0, 50),
      type: body.type || "skill",
      price,
      isFree,
      installCmd: body.installCmd ? sanitize(body.installCmd).slice(0, 500) : null,
      sourceUrl: body.sourceUrl ? body.sourceUrl.slice(0, 500) : "",
      sourceType: body.sourceType || "github",
      compatibility: (body.compatibility || "claude-code").slice(0, 200),
      tags: body.tags ? sanitize(body.tags).slice(0, 500) : null,
      listingType: isCommunity ? "community" : "original",
      originalAuthor: body.originalAuthor ? sanitize(body.originalAuthor).slice(0, 100) : null,
      originalUrl: body.originalUrl ? body.originalUrl.slice(0, 500) : null,
      authorId: userId,
    },
  });

  // Store skill content
  if (body.skillContent) {
    const content = body.skillContent.slice(0, 100_000);
    await prisma.skillFile.create({
      data: { skillId: skill.id, filename: "SKILL.md", content },
    });
  }

  // Multi-file support
  if (Array.isArray(body.files)) {
    for (const file of body.files.slice(0, 20)) {
      if (file.filename && file.content) {
        await prisma.skillFile.create({
          data: {
            skillId: skill.id,
            filename: sanitize(file.filename).slice(0, 200),
            content: file.content.slice(0, 100_000),
          },
        });
      }
    }
  }

  // Dependencies
  if (Array.isArray(body.dependencies)) {
    for (const depSlug of body.dependencies.slice(0, 20)) {
      const dep = await prisma.skill.findUnique({
        where: { slug: depSlug },
        select: { id: true },
      });
      if (dep) {
        await prisma.skillDependency.create({
          data: { skillId: skill.id, dependsOnId: dep.id },
        });
      }
    }
  }

  // Auto-verify source
  if (skill.sourceUrl) {
    verifySkillSource(skill.id).catch(() => {});
  }

  return NextResponse.json(skill, { status: 201 });
}
