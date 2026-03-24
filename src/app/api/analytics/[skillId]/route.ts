// Publisher Analytics
// GET /api/analytics/[skillId] — install stats for skill owner

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { authorId: true },
  });

  if (!skill || skill.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const days7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, last7d, last30d, bySource] = await Promise.all([
    prisma.installEvent.count({ where: { skillId } }),
    prisma.installEvent.count({ where: { skillId, createdAt: { gte: days7 } } }),
    prisma.installEvent.count({ where: { skillId, createdAt: { gte: days30 } } }),
    prisma.installEvent.groupBy({
      by: ["source"],
      where: { skillId },
      _count: true,
    }),
  ]);

  const sourceMap: Record<string, number> = {};
  for (const s of bySource) {
    sourceMap[s.source] = s._count;
  }

  return NextResponse.json({
    total,
    last7d,
    last30d,
    bySource: sourceMap,
  });
}
