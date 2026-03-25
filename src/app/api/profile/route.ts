import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitize } from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, bio } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof name === "string" ? { name: sanitize(name).slice(0, 100) } : {}),
      ...(typeof bio === "string" ? { bio: sanitize(bio).slice(0, 500) } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
