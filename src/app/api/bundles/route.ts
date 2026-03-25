// Bundles API
// GET /api/bundles — list all bundles
// POST /api/bundles — create a bundle (admin only)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { sanitize } from "@/lib/validation";

export async function GET() {
  const bundles = await prisma.bundle.findMany({
    include: {
      skills: {
        include: {
          skill: {
            select: {
              slug: true, name: true, type: true, description: true,
              isFree: true, price: true, securityScore: true,
            },
          },
        },
      },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bundles);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const slug = (body.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const bundle = await prisma.bundle.create({
    data: {
      slug,
      name: sanitize(body.name).slice(0, 100),
      description: sanitize(body.description).slice(0, 300),
      longDescription: body.longDescription ? sanitize(body.longDescription).slice(0, 5000) : null,
      category: body.category || "general",
      price: body.isFree ? 0 : Math.max(0.99, Number(body.price) || 0),
      isFree: body.isFree ?? true,
      discount: body.discount || null,
      authorId: admin.id!,
    },
  });

  // Link skills
  if (Array.isArray(body.skillSlugs)) {
    for (const skillSlug of body.skillSlugs) {
      const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
      if (skill) {
        await prisma.bundleSkill.create({
          data: { bundleId: bundle.id, skillId: skill.id },
        });
      }
    }
  }

  return NextResponse.json(bundle, { status: 201 });
}
