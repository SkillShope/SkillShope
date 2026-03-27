import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const { id } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!skill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(skill);
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (skill.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  // Allowed fields to update
  if (typeof body.name === "string") data.name = sanitize(body.name).slice(0, 100);
  if (typeof body.description === "string") data.description = sanitize(body.description).slice(0, 300);
  if (typeof body.longDescription === "string") data.longDescription = sanitize(body.longDescription).slice(0, 5000);
  if (typeof body.tags === "string") data.tags = sanitize(body.tags).slice(0, 500);
  if (typeof body.installCmd === "string") data.installCmd = sanitize(body.installCmd).slice(0, 500);
  if (typeof body.hidden === "boolean") data.hidden = body.hidden;

  // Only allow price changes if publisher has Stripe
  if (body.isFree !== undefined || body.price !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true, isAdmin: true },
    });
    const hasStripe = !!user?.stripeAccountId;
    const isAdmin = user?.isAdmin ?? false;

    if (body.isFree === false && !hasStripe && !isAdmin) {
      return NextResponse.json(
        { error: "Connect your Stripe account to offer paid skills" },
        { status: 400 }
      );
    }

    if (typeof body.isFree === "boolean") {
      data.isFree = body.isFree;
      if (body.isFree) {
        data.price = 0;
      } else {
        data.price = Math.max(0.99, Number(body.price) || 0);
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.skill.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const skill = await prisma.skill.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!skill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (skill.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
