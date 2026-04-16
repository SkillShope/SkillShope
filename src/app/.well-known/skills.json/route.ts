import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blueprints = await prisma.blueprint.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      category: true,
      tags: true,
      isFree: true,
    },
    orderBy: { downloads: "desc" },
    take: 500,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roughinhub.com";

  return NextResponse.json(
    {
      version: 1,
      registry: "roughinhub",
      url: siteUrl,
      catalog_url: `${siteUrl}/api/blueprints`,
      updated_at: new Date().toISOString(),
      blueprints,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
