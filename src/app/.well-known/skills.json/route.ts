import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const skills = await prisma.skill.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      type: true,
      compatibility: true,
      verified: true,
      tags: true,
      isFree: true,
      installCmd: true,
      listingType: true,
      originalAuthor: true,
    },
    orderBy: { downloads: "desc" },
    take: 500,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skillshope.com";

  return NextResponse.json(
    {
      version: 1,
      registry: "skillshope",
      url: siteUrl,
      catalog_url: `${siteUrl}/api/skills`,
      updated_at: new Date().toISOString(),
      skills,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
