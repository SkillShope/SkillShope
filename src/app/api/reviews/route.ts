import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitize } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`review:${session.user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();

  // Validate rating
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { errors: [{ field: "rating", message: "Rating must be 1-5" }] },
      { status: 400 }
    );
  }

  // Validate skill exists
  if (!body.skillId || typeof body.skillId !== "string") {
    return NextResponse.json(
      { errors: [{ field: "skillId", message: "skillId is required" }] },
      { status: 400 }
    );
  }

  const skill = await prisma.skill.findUnique({ where: { id: body.skillId } });
  if (!skill) {
    return NextResponse.json(
      { errors: [{ field: "skillId", message: "Skill not found" }] },
      { status: 404 }
    );
  }

  // Prevent reviewing own skill
  if (skill.authorId === session.user.id) {
    return NextResponse.json(
      { errors: [{ field: "skillId", message: "You cannot review your own skill" }] },
      { status: 403 }
    );
  }

  // Require purchase to review paid skills
  if (!skill.isFree) {
    const purchase = await prisma.purchase.findUnique({
      where: { userId_skillId: { userId: session.user.id, skillId: body.skillId } },
    });
    if (!purchase) {
      return NextResponse.json(
        { errors: [{ field: "skillId", message: "Purchase this skill before reviewing" }] },
        { status: 403 }
      );
    }
  }

  // Prevent duplicate reviews
  const existingReview = await prisma.review.findFirst({
    where: { skillId: body.skillId, userId: session.user.id },
  });
  if (existingReview) {
    return NextResponse.json(
      { errors: [{ field: "skillId", message: "You already reviewed this skill" }] },
      { status: 409 }
    );
  }

  const comment = body.comment ? sanitize(body.comment).slice(0, 1000) : null;

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      skillId: body.skillId,
      userId: session.user.id,
    },
  });

  // Update skill rating aggregate
  const agg = await prisma.review.aggregate({
    where: { skillId: body.skillId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.skill.update({
    where: { id: body.skillId },
    data: {
      rating: agg._avg.rating || 0,
      reviewCount: agg._count,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
