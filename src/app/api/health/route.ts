import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  let dbHealthy = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    // Database unreachable
  }

  return NextResponse.json(
    { status: dbHealthy ? "healthy" : "degraded" },
    { status: dbHealthy ? 200 : 503 }
  );
}
