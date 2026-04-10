// Admin Blueprints API
// Auth: requires admin session (cookie-based via requireAdmin)
//
// GET  /api/admin/blueprints          — List all blueprints with author info
// PATCH /api/admin/blueprints         — Manage a blueprint
//   body: { id: string, action: "feature" | "unfeature" | "remove" }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const blueprints = await prisma.blueprint.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blueprints);
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

  const blueprint = await prisma.blueprint.findUnique({ where: { id } });
  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  switch (action) {
    case "feature":
      await prisma.blueprint.update({ where: { id }, data: { featured: true } });
      break;
    case "unfeature":
      await prisma.blueprint.update({ where: { id }, data: { featured: false } });
      break;
    case "remove":
      await prisma.blueprint.delete({ where: { id } });
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
