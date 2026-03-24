// Skill Delivery API
// Serves skill content to users.
//
// Free skills: open access, no auth required
// Paid skills: requires download token (?token=xxx) or authenticated session with purchase
//
// GET /api/deliver/[skillId]
// GET /api/deliver/[skillId]?token=<download-token>

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  const { skillId } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { id: true, isFree: true, slug: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Paid skills — verify access
  if (!skill.isFree) {
    const token = req.nextUrl.searchParams.get("token");
    let authorized = false;

    if (token) {
      // Rate limit token attempts per IP
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const { allowed } = rateLimit(`deliver:${ip}`, 10, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }

      // Look up all tokens for this skill to do constant-time comparison
      const tokens = await prisma.downloadToken.findMany({
        where: { purchase: { skillId } },
        include: { purchase: true },
      });

      for (const dt of tokens) {
        try {
          const a = Buffer.from(token);
          const b = Buffer.from(dt.token);
          if (a.length === b.length && timingSafeEqual(a, b)) {
            if (!dt.expiresAt || dt.expiresAt > new Date()) {
              authorized = true;
            }
            break;
          }
        } catch {
          // Length mismatch — not a match
        }
      }
    } else {
      const session = await auth();
      if (session?.user?.id) {
        const purchase = await prisma.purchase.findUnique({
          where: { userId_skillId: { userId: session.user.id, skillId } },
        });
        authorized = !!purchase;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Purchase required", purchaseUrl: `/skills/${skill.slug}` },
        { status: 403 }
      );
    }
  }

  // Fetch and serve skill files
  const files = await prisma.skillFile.findMany({
    where: { skillId },
    select: { filename: true, content: true },
  });

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No content available for this skill" },
      { status: 404 }
    );
  }

  // Increment download count
  await prisma.skill.update({
    where: { id: skillId },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.json({ files });
}
