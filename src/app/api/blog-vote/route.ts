import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getPost } from "@/lib/blog";

// GET - get vote count and whether current user has voted
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug || !(await getPost(slug))) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const count = await prisma.blogVote.count({ where: { postSlug: slug } });

  const session = await auth();
  let voted = false;
  if (session?.user?.id) {
    const existing = await prisma.blogVote.findUnique({
      where: { postSlug_userId: { postSlug: slug, userId: session.user.id } },
    });
    voted = !!existing;
  }

  return NextResponse.json({ count, voted });
}

// POST - toggle vote
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });
  }

  const { allowed } = rateLimit(`blog-vote:${session.user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  const { slug } = await req.json();
  if (!slug || !(await getPost(slug))) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  // Toggle: if already voted, remove it. If not, add it.
  const existing = await prisma.blogVote.findUnique({
    where: { postSlug_userId: { postSlug: slug, userId: session.user.id } },
  });

  if (existing) {
    await prisma.blogVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.blogVote.create({
      data: { postSlug: slug, userId: session.user.id },
    });
  }

  const count = await prisma.blogVote.count({ where: { postSlug: slug } });

  return NextResponse.json({ count, voted: !existing });
}
