// Blueprint Delivery API
// Verifies access (token or session purchase) and returns download info.
//
// Free blueprints: open access, no auth required
// Paid blueprints: requires download token (?token=xxx) or authenticated session with purchase
//
// GET /api/deliver/[blueprintId]
// GET /api/deliver/[blueprintId]?token=<download-token>

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { auditInfo, auditWarn } from "@/lib/audit";
import { getBlobToken } from "@/lib/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  const { blueprintId } = await params;

  const blueprint = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    select: { id: true, isFree: true, slug: true },
  });

  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  // Paid blueprints — verify access
  if (!blueprint.isFree) {
    const token = req.nextUrl.searchParams.get("token");
    let authorized = false;

    if (token) {
      // Rate limit token attempts per IP
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const { allowed } = rateLimit(`deliver:${ip}`, 10, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }

      // Look up all tokens for this blueprint to do constant-time comparison
      const tokens = await prisma.downloadToken.findMany({
        where: { purchase: { blueprintId } },
        include: { purchase: true },
      });

      for (const dt of tokens) {
        try {
          const a = Buffer.from(token);
          const b = Buffer.from(dt.token);
          if (a.length === b.length && timingSafeEqual(a, b)) {
            if (!dt.expiresAt || dt.expiresAt > new Date()) {
              authorized = true;
            }
            break;
          }
        } catch {
          // Length mismatch — not a match
        }
      }
    } else {
      const session = await auth();
      if (session?.user?.id) {
        const purchase = await prisma.purchase.findUnique({
          where: { userId_blueprintId: { userId: session.user.id, blueprintId } },
        });
        authorized = !!purchase;
      }
    }

    if (!authorized) {
      auditWarn("deliver.denied", { blueprintId, metadata: { reason: "unauthorized" } });
      return NextResponse.json(
        { error: "Purchase required", purchaseUrl: `/blueprints/${blueprint.slug}` },
        { status: 403 }
      );
    }
  }

  // Fetch files for this blueprint
  const files = await prisma.blueprintFile.findMany({
    where: { blueprintId },
    select: { id: true, filename: true, blobUrl: true, size: true, mimeType: true },
  });

  if (files.length === 0) {
    return NextResponse.json({ error: "No files available for this blueprint" }, { status: 404 });
  }

  // Increment download counter (non-blocking)
  prisma.blueprint.update({
    where: { id: blueprintId },
    data: { downloads: { increment: 1 } },
  }).catch(() => {});

  auditInfo("deliver.success", { blueprintId, metadata: { fileCount: files.length } });

  // For single file, proxy the download from Vercel Blob (private store requires auth)
  if (files.length === 1) {
    const file = files[0];
    const blobRes = await fetch(file.blobUrl, {
      headers: { Authorization: `Bearer ${getBlobToken()}` },
    });

    if (!blobRes.ok) {
      return NextResponse.json({ error: "File download failed" }, { status: 502 });
    }

    return new NextResponse(blobRes.body, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(file.size),
      },
    });
  }

  // Multiple files - return download links (each proxied through this same endpoint)
  return NextResponse.json({
    blueprintId,
    files: files.map((f) => ({
      id: f.id,
      filename: f.filename,
      url: `/api/deliver/${blueprintId}/file/${f.id}`,
      size: f.size,
      mimeType: f.mimeType,
    })),
  });
}
