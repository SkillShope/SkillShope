// Admin Users API
// Auth: requires admin session (cookie-based via requireAdmin)
// Future: add API key auth for external access (CI/CD, dashboards, etc.)
//
// GET  /api/admin/users           — List all users with skill/review counts
// PATCH /api/admin/users          — Manage a user
//   body: { id: string, action: "verify" | "unverify" }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      publisherVerified: true,
      stripeAccountId: true,
      createdAt: true,
      _count: { select: { skills: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
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

  switch (action) {
    case "verify":
      await prisma.user.update({ where: { id }, data: { publisherVerified: true } });
      break;
    case "unverify":
      await prisma.user.update({ where: { id }, data: { publisherVerified: false } });
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
