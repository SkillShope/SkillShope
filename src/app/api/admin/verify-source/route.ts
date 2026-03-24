// Admin Source Verification API
// POST /api/admin/verify-source — Verify a single skill's source
//   body: { skillId: string }
// POST /api/admin/verify-source?all=true — Verify all pending/stale skills

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { verifySkillSource } from "@/lib/source-verify";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const verifyAll = req.nextUrl.searchParams.get("all") === "true";

  if (verifyAll) {
    // Verify all skills that are pending or haven't been checked in 24 hours
    const staleDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { sourceStatus: "pending" },
          { sourceCheckedAt: { lt: staleDate } },
          { sourceCheckedAt: null },
        ],
      },
      select: { id: true },
    });

    const results = [];
    for (const skill of skills) {
      const result = await verifySkillSource(skill.id);
      results.push({ skillId: skill.id, ...result });
    }

    return NextResponse.json({ verified: results.length, results });
  }

  const { skillId } = await req.json();
  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  const result = await verifySkillSource(skillId);
  return NextResponse.json(result);
}
