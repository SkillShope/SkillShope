import { NextRequest, NextResponse } from "next/server";
import { hashApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit by IP to prevent brute-force key guessing
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`verify-key:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { key } = await req.json();

  if (!key || typeof key !== "string" || !key.startsWith("sk_")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  // Update last used
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(() => {});

  return NextResponse.json({
    name: apiKey.user.name,
    email: apiKey.user.email,
  });
}
