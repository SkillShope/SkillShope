// Admin: Run security scan on a skill or all pending/unscanned skills
// POST /api/admin/security-scan — body: { skillId } or ?all=true

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { runSecurityPipeline } from "@/lib/security";
import type { SkillInput } from "@/lib/security/types";

async function scanSkill(skillId: string) {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { files: { select: { content: true } } },
  });

  if (!skill) return null;

  const content = skill.files.map((f) => f.content).join("\n\n");

  const input: SkillInput = {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    sourceUrl: skill.sourceUrl,
    sourceType: skill.sourceType,
    content,
    installCmd: skill.installCmd || undefined,
  };

  const report = await runSecurityPipeline(input);

  // Store report
  await prisma.securityReport.create({
    data: {
      skillId: skill.id,
      status: report.status,
      score: report.score,
      checks: JSON.stringify(report.checks),
    },
  });

  // Update skill review status and score
  await prisma.skill.update({
    where: { id: skill.id },
    data: {
      reviewStatus: report.status,
      securityScore: report.score,
    },
  });

  return report;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scanAll = req.nextUrl.searchParams.get("all") === "true";

  if (scanAll) {
    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { reviewStatus: "pending" },
          { securityScore: null },
        ],
      },
      select: { id: true },
    });

    const results = [];
    for (const skill of skills) {
      const report = await scanSkill(skill.id);
      if (report) {
        results.push({ skillId: skill.id, status: report.status, score: report.score });
      }
    }

    return NextResponse.json({ scanned: results.length, results });
  }

  const { skillId } = await req.json();
  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  const report = await scanSkill(skillId);
  if (!report) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
