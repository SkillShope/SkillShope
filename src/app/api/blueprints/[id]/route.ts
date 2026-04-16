import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const blueprint = await prisma.blueprint.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, showAvatar: true } },
    },
  });

  if (!blueprint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(blueprint);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const blueprint = await prisma.blueprint.findUnique({ where: { id } });

  if (!blueprint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (blueprint.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.blueprint.update({
    where: { id },
    data: {
      ...(body.name && { name: sanitize(body.name).slice(0, 100) }),
      ...(body.description && { description: sanitize(body.description).slice(0, 500) }),
      ...(body.longDescription !== undefined && { longDescription: body.longDescription ? sanitize(body.longDescription).slice(0, 5000) : null }),
      ...(body.tags !== undefined && { tags: body.tags ? sanitize(body.tags).slice(0, 500) : null }),
      ...(body.region !== undefined && { region: body.region ? sanitize(body.region).slice(0, 100) : null }),
      ...(body.isFree !== undefined && { isFree: body.isFree }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.hidden !== undefined && { hidden: body.hidden }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const blueprint = await prisma.blueprint.findUnique({ where: { id } });

  if (!blueprint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (blueprint.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.blueprint.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
