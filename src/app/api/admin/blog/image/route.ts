// Admin Blog Image Upload
// Auth: requires admin session
//
// POST   /api/admin/blog/image  - Upload an image, returns URL
// DELETE /api/admin/blog/image  - Remove image from a blog post

import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getBlobToken } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const postId = formData.get("postId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and AVIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "Image must be under 5MB" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`blog/${postId || "draft"}/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      token: getBlobToken(),
    });

    // If postId provided, update the blog post immediately
    if (postId) {
      const post = await prisma.blogPost.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Delete old image from blob if it exists
      if (post.imageUrl) {
        try {
          await del(post.imageUrl, { token: getBlobToken() });
        } catch {
          // Old image may already be gone
        }
      }

      await prisma.blogPost.update({
        where: { id: postId },
        data: { imageUrl: blob.url },
      });
    }

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Blog image upload failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.imageUrl) {
    try {
      await del(post.imageUrl, { token: getBlobToken() });
    } catch {
      // Blob may already be gone
    }
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: { imageUrl: null },
  });

  return NextResponse.json({ success: true });
}
