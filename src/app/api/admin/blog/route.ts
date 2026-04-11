// Admin Blog API
// Auth: requires admin session (cookie-based via requireAdmin)
//
// GET    /api/admin/blog          - List all blog posts (including drafts)
// POST   /api/admin/blog          - Create a new blog post
// PATCH  /api/admin/blog          - Update an existing blog post
// DELETE /api/admin/blog          - Delete a blog post

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, content, category, author, readTime, ctaText, ctaLink, published } = body;

  if (!title || !description || !content || !category) {
    return NextResponse.json({ error: "title, description, content, and category are required" }, { status: 400 });
  }

  const slug = slugify(title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title,
      description,
      content,
      category,
      author: author || "RoughInHub Team",
      readTime: readTime || "5 min read",
      ctaText: ctaText || null,
      ctaLink: ctaLink || null,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // If toggling to published for the first time, set publishedAt
  if (updates.published === true && !post.published && !post.publishedAt) {
    updates.publishedAt = new Date();
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
