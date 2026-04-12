// Public proxy for blog post images stored in private Vercel Blob.
// Streams the image with aggressive caching (images are immutable once uploaded).
//
// GET /api/blog-image?url=<blob-url>

import { NextRequest, NextResponse } from "next/server";
import { getBlobToken } from "@/lib/blob";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.includes(".blob.vercel-storage.com/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const blobRes = await fetch(url, {
    headers: { Authorization: `Bearer ${getBlobToken()}` },
  });

  if (!blobRes.ok || !blobRes.body) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const contentType = blobRes.headers.get("content-type") || "image/jpeg";

  return new NextResponse(blobRes.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
