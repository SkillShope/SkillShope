import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/estimate/[id] - Get a specific estimate
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: estimate.id,
    estimateNumber: estimate.estimateNumber,
    jobDescription: estimate.jobDescription,
    jobType: estimate.jobType,
    data: JSON.parse(estimate.data),
    contractData: estimate.contractData ? JSON.parse(estimate.contractData) : null,
    createdAt: estimate.createdAt,
  });
}

// PATCH /api/estimate/[id] - Update estimate data (inline edits)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, estimateNumber } = await req.json();

  const updateData: Record<string, unknown> = {};
  if (data) updateData.data = JSON.stringify(data);
  if (estimateNumber !== undefined) updateData.estimateNumber = estimateNumber;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.estimate.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    id: updated.id,
    estimateNumber: updated.estimateNumber,
    data: JSON.parse(updated.data),
  });
}

// DELETE /api/estimate/[id] - Delete an estimate
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.estimate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
