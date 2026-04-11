import { prisma } from "./prisma";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  ctaText: string;
  ctaLink: string;
  content: string;
};

function toPublic(row: {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date | null;
  author: string;
  category: string;
  readTime: string;
  ctaText: string | null;
  ctaLink: string | null;
  content: string;
  createdAt: Date;
}): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: (row.publishedAt ?? row.createdAt).toISOString().split("T")[0],
    author: row.author,
    category: row.category,
    readTime: row.readTime,
    ctaText: row.ctaText ?? "",
    ctaLink: row.ctaLink ?? "/browse",
    content: row.content,
  };
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  });
  return row ? toPublic(row) : undefined;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPublic);
}

export async function getPostSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
