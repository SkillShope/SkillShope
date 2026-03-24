// Admin: Happie usage analytics
// GET /api/admin/happie-stats

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const days7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, last7d, last30d, byType, uniqueUsers] = await Promise.all([
    prisma.happieEvent.count(),
    prisma.happieEvent.count({ where: { createdAt: { gte: days7 } } }),
    prisma.happieEvent.count({ where: { createdAt: { gte: days30 } } }),
    prisma.happieEvent.groupBy({ by: ["type"], _count: true }),
    prisma.happieEvent.groupBy({ by: ["userId"], where: { userId: { not: null } } }),
  ]);

  const typeMap: Record<string, number> = {};
  for (const t of byType) {
    typeMap[t.type] = t._count;
  }

  return NextResponse.json({
    total,
    last7d,
    last30d,
    byType: typeMap,
    uniqueUsers: uniqueUsers.length,
  });
}
