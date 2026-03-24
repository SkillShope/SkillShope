// Admin Skills API
// Auth: requires admin session (cookie-based via requireAdmin)
// Future: add API key auth for external access (CI/CD, dashboards, etc.)
//
// GET  /api/admin/skills          — List all skills with author info
// PATCH /api/admin/skills         — Manage a skill
//   body: { id: string, action: "feature" | "unfeature" | "verify" | "unverify" | "remove" }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const skills = await prisma.skill.findMany({
    include: { author: { select: { id: true, name: true, email: true, publisherVerified: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(skills);
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, action } = await req.json();

  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  switch (action) {
    case "feature":
      await prisma.skill.update({ where: { id }, data: { featured: true } });
      break;
    case "unfeature":
      await prisma.skill.update({ where: { id }, data: { featured: false } });
      break;
    case "verify":
      await prisma.skill.update({ where: { id }, data: { verified: true } });
      break;
    case "unverify":
      await prisma.skill.update({ where: { id }, data: { verified: false } });
      break;
    case "remove":
      await prisma.skill.delete({ where: { id } });
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
