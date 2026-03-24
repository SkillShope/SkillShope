// API Key Management
// POST /api/api-keys — create a new API key (session-authed)
// GET /api/api-keys — list keys (session-authed)
// DELETE /api/api-keys — revoke a key by id (session-authed)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey, hashApiKey } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const plainKey = generateApiKey();
  const keyHash = hashApiKey(plainKey);

  await prisma.apiKey.create({
    data: {
      keyHash,
      name: name.slice(0, 100),
      userId: session.user.id,
    },
  });

  // Return plaintext key ONCE — it cannot be retrieved again
  return NextResponse.json({ key: plainKey, name }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Ensure the key belongs to this user
  const key = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  await prisma.apiKey.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
