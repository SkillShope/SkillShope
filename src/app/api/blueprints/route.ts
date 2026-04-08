import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validate, sanitize, isValidSlug } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

const VALID_TYPES = ["pdf", "excel", "zip-pack", "doc"];
const VALID_CATEGORIES = [
  "estimating-bidding", "service-repair", "proposals-contracts",
  "training", "marketing", "safety-compliance", "residential", "commercial",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.slice(0, 200);
  const category = searchParams.get("category")?.slice(0, 50);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { hidden: false };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category && VALID_CATEGORIES.includes(category)) where.category = category;
  if (type && VALID_TYPES.includes(type)) where.type = type;

  const blueprints = await prisma.blueprint.findMany({
    where,
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(blueprints);
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

  const errors = validate([
    { field: "name", value: body.name, required: true, minLength: 2, maxLength: 100 },
    { field: "slug", value: body.slug, required: true, minLength: 2, maxLength: 100 },
    { field: "description", value: body.description, required: true, minLength: 10, maxLength: 500 },
    { field: "category", value: body.category, required: true, maxLength: 50 },
  ]);

  if (!isValidSlug(body.slug || "")) {
    errors.push({ field: "slug", message: "slug must be lowercase alphanumeric with hyphens" });
  }
  if (body.type && !VALID_TYPES.includes(body.type)) {
    errors.push({ field: "type", message: "Invalid file type" });
  }
  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    errors.push({ field: "category", message: "Invalid category" });
  }
  if (!body.contentAcknowledged) {
    errors.push({ field: "contentAcknowledged", message: "You must confirm this is your original work" });
  }
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const existing = await prisma.blueprint.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json(
      { errors: [{ field: "slug", message: "This slug is already taken" }] },
      { status: 409 }
    );
  }

  const isFree = body.isFree ?? true;
  const price = isFree ? 0 : Math.max(0.99, Number(body.price) || 0);

  const blueprint = await prisma.blueprint.create({
    data: {
      slug: body.slug,
      name: sanitize(body.name),
      description: sanitize(body.description),
      longDescription: body.longDescription ? sanitize(body.longDescription).slice(0, 5000) : null,
      category: body.category,
      type: body.type || "pdf",
      price,
      isFree,
      region: body.region ? sanitize(body.region).slice(0, 100) : null,
      tags: body.tags ? sanitize(body.tags).slice(0, 500) : null,
      contentAcknowledgedAt: new Date(),
      authorId: session.user.id,
    },
  });

  return NextResponse.json(blueprint, { status: 201 });
}
