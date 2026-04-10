// Get download token for a purchased blueprint
// GET /api/deliver/token?blueprintId=xxx

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blueprintId = req.nextUrl.searchParams.get("blueprintId");
  if (!blueprintId) {
    return NextResponse.json({ error: "blueprintId required" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { userId_blueprintId: { userId: session.user.id, blueprintId } },
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
