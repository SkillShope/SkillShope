// Admin Users API
// Auth: requires admin session (cookie-based via requireAdmin)
//
// GET  /api/admin/users — List all users with blueprint counts
// PATCH /api/admin/users — Manage a user
//   body: { id: string, action: "make-admin" | "remove-admin" }

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
      stripeAccountId: true,
      createdAt: true,
      _count: { select: { blueprints: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Redact stripeAccountId to boolean
  const sanitized = users.map(({ stripeAccountId, ...user }) => ({
    ...user,
    hasStripeAccount: !!stripeAccountId,
  }));

  return NextResponse.json(sanitized);
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
    case "make-admin":
      await prisma.user.update({ where: { id }, data: { isAdmin: true } });
      break;
    case "remove-admin":
      await prisma.user.update({ where: { id }, data: { isAdmin: false } });
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
