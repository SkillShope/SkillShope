import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getBlobToken } from "@/lib/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  validateFileType,
  validateFileSize,
  validateFileExtension,
  getExtensionFromFilename,
} from "@/lib/upload-validation";
import {
  MAX_FILES_PER_BLUEPRINT,
  MAX_STORAGE_PER_CREATOR_BYTES,
  UPLOAD_RATE_LIMIT,
  UPLOAD_RATE_WINDOW_MS,
} from "@/lib/constants";

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { allowed } = rateLimit(
    `upload:${session.user.id}`,
    UPLOAD_RATE_LIMIT,
    UPLOAD_RATE_WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }

  // Parse form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const blueprintId = formData.get("blueprintId") as string | null;

  if (!file || !blueprintId) {
    return NextResponse.json({ error: "File and blueprintId are required" }, { status: 400 });
  }

  // Verify blueprint exists and user owns it
  const blueprint = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    select: { id: true, authorId: true },
  });
  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }
  if (blueprint.authorId !== session.user.id) {
    return NextResponse.json({ error: "You don't own this blueprint" }, { status: 403 });
  }

  // Validate file extension
  const ext = getExtensionFromFilename(file.name);
  if (!validateFileExtension(ext)) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: .pdf, .xlsx, .xls, .docx, .doc, .zip, .mp4, .mov" },
      { status: 400 }
    );
  }

  // Validate MIME type
  if (!validateFileType(file.type)) {
    return NextResponse.json(
      { error: `MIME type "${file.type}" not allowed` },
      { status: 400 }
    );
  }

  // Validate file size
  if (!validateFileSize(file.size)) {
    return NextResponse.json(
      { error: "File must be between 1 byte and 25MB" },
      { status: 400 }
    );
  }

  // Check files-per-blueprint limit
  const existingFiles = await prisma.blueprintFile.count({
    where: { blueprintId },
  });
  if (existingFiles >= MAX_FILES_PER_BLUEPRINT) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES_PER_BLUEPRINT} files per blueprint` },
      { status: 400 }
    );
  }

  // Check creator storage limit
  const storageUsed = await prisma.blueprintFile.aggregate({
    where: { blueprint: { authorId: session.user.id } },
    _sum: { size: true },
  });
  const currentUsage = storageUsed._sum.size || 0;
  if (currentUsage + file.size > MAX_STORAGE_PER_CREATOR_BYTES) {
    return NextResponse.json(
      { error: "Storage limit reached (500MB). Delete some files or contact support." },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob
  try {
    const blob = await put(`blueprints/${blueprintId}/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
      token: getBlobToken(),
    });

    // Save metadata to database
    const blueprintFile = await prisma.blueprintFile.create({
      data: {
        blueprintId,
        filename: file.name,
        blobUrl: blob.url,
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(blueprintFile, { status: 201 });
  } catch (err) {
    console.error("Upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
