import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roughinhub.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blueprints: { slug: string; updatedAt: Date; featured: boolean }[] = [];
  try {
    blueprints = await prisma.blueprint.findMany({
      where: { hidden: false },
      select: { slug: true, updatedAt: true, featured: true },
    });
  } catch {
    // Table may not exist during build - return static pages only
  }

  return [
    // Core pages
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },

    // Blog
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...getAllPosts().map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // Blueprint pages
    ...blueprints.map((blueprint) => ({
      url: `${siteUrl}/blueprints/${blueprint.slug}`,
      lastModified: blueprint.updatedAt,
      changeFrequency: "weekly" as const,
      priority: blueprint.featured ? 0.8 : 0.6,
    })),
  ];
}
