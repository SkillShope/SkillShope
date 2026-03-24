import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skillshope.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const skills = await prisma.skill.findMany({
    select: { slug: true, updatedAt: true },
  });

  const skillPages = skills.map((skill) => ({
    url: `${siteUrl}/skills/${skill.slug}`,
    lastModified: skill.updatedAt,
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/browse`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/terms`, lastModified: new Date() },
    ...skillPages,
  ];
}
