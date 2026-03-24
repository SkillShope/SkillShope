// Get download token for a purchased skill
// GET /api/deliver/token?skillId=xxx

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skillId = req.nextUrl.searchParams.get("skillId");
  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { userId_skillId: { userId: session.user.id, skillId } },
    include: { downloadToken: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Not purchased" }, { status: 403 });
  }

  if (!purchase.downloadToken) {
    return NextResponse.json({ error: "Token not yet generated" }, { status: 404 });
  }

  return NextResponse.json({ token: purchase.downloadToken.token });
}
