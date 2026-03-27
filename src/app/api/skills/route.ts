import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validate, sanitize, isValidUrl, isValidSlug } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { verifySkillSource } from "@/lib/source-verify";
import { runSecurityPipeline } from "@/lib/security";
import type { SkillInput } from "@/lib/security/types";

const VALID_TYPES = ["skill", "mcp-server", "agent"];
const VALID_SOURCE_TYPES = ["github", "npm", "other"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.slice(0, 200);
  const category = searchParams.get("category")?.slice(0, 50);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (type && VALID_TYPES.includes(type)) where.type = type;

  const skills = await prisma.skill.findMany({
    where,
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`publish:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();

  // Validate
  const errors = validate([
    { field: "name", value: body.name, required: true, minLength: 2, maxLength: 100 },
    { field: "slug", value: body.slug, required: true, minLength: 2, maxLength: 100 },
    { field: "description", value: body.description, required: true, minLength: 10, maxLength: 300 },
    { field: "category", value: body.category, required: true, maxLength: 50 },
    { field: "sourceUrl", value: body.sourceUrl, required: false, maxLength: 500 },
  ]);

  if (!isValidSlug(body.slug || "")) {
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
  const existing = await prisma.skill.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json(
      { errors: [{ field: "slug", message: "This slug is already taken" }] },
      { status: 409 }
    );
  }

  // Check if publisher has Stripe payouts enabled (not just account created)
  const publisher = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripePayoutsEnabled: true, isAdmin: true },
  });
  const hasStripe = publisher?.stripePayoutsEnabled ?? false;
  const isAdmin = publisher?.isAdmin ?? false;

  const isCommunity = body.listingType === "community";
  // Force free if no Stripe connected (admins exempt — platform skills)
  const isFree = isCommunity ? true : (!hasStripe && !isAdmin) ? true : (body.isFree ?? true);
  const price = isFree ? 0 : Math.max(0.99, Number(body.price) || 0);
  // Hide skills from publishers without Stripe (admins exempt)
  const hidden = !hasStripe && !isAdmin;

  const skill = await prisma.skill.create({
    data: {
      slug: body.slug,
      name: sanitize(body.name),
      description: sanitize(body.description),
      longDescription: body.longDescription ? sanitize(body.longDescription).slice(0, 5000) : null,
      category: body.category.slice(0, 50),
      type: body.type || "skill",
      price,
      isFree,
      hidden,
      installCmd: body.installCmd ? sanitize(body.installCmd).slice(0, 500) : null,
      sourceUrl: body.sourceUrl.slice(0, 500),
      sourceType: body.sourceType || "github",
      compatibility: (body.compatibility || "claude-code").slice(0, 200),
      tags: body.tags ? sanitize(body.tags).slice(0, 500) : null,
      listingType: body.listingType === "community" ? "community" : "original",
      originalAuthor: body.originalAuthor ? sanitize(body.originalAuthor).slice(0, 100) : null,
      originalUrl: body.originalUrl && isValidUrl(body.originalUrl) ? body.originalUrl.slice(0, 500) : null,
      authorId: session.user.id,
    },
  });

  // Store skill content for CLI delivery
  if (body.skillContent) {
    const content = body.skillContent.slice(0, 100_000); // 100KB max
    await prisma.skillFile.create({
      data: {
        skillId: skill.id,
        filename: "SKILL.md",
        content,
      },
    });
  }

  // Run security pipeline in the background (non-blocking)
  const securityInput: SkillInput = {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    sourceUrl: skill.sourceUrl,
    sourceType: skill.sourceType,
    content: body.skillContent || undefined,
    installCmd: skill.installCmd || undefined,
  };

  runSecurityPipeline(securityInput)
    .then(async (report) => {
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
    })
    .catch((err) => {
      console.error(`Security pipeline failed for skill ${skill.id}:`, err);
    });

  return NextResponse.json(skill, { status: 201 });
}
