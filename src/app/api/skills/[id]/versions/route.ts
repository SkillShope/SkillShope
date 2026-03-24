// Skill Version Management
// POST /api/skills/[id]/versions — publish a new version

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { authenticateApiKey } from "@/lib/api-auth";
import { sanitize } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth via session or API key
  const session = await auth();
  let userId = session?.user?.id || null;
  if (!userId) {
    userId = await authenticateApiKey(req.headers.get("authorization"));
  }
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  // Must be the author
  if (skill.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { version, changelog, files } = body;

  if (!version || typeof version !== "string") {
    return NextResponse.json({ error: "version is required (semver)" }, { status: 400 });
  }

  // Check version doesn't already exist
  const existing = await prisma.skillVersion.findUnique({
    where: { skillId_version: { skillId: id, version } },
  });
  if (existing) {
    return NextResponse.json({ error: "Version already exists" }, { status: 409 });
  }

  // Create version
  const skillVersion = await prisma.skillVersion.create({
    data: {
      skillId: id,
      version,
      changelog: changelog ? sanitize(changelog).slice(0, 5000) : null,
    },
  });

  // Create versioned files
  if (Array.isArray(files)) {
    for (const file of files.slice(0, 20)) {
      if (file.filename && file.content) {
        await prisma.skillFile.create({
          data: {
            skillId: id,
            versionId: skillVersion.id,
            filename: sanitize(file.filename).slice(0, 200),
            content: file.content.slice(0, 100_000),
          },
        });
      }
    }
  }

  // Update current version
  await prisma.skill.update({
    where: { id },
    data: { currentVersion: version },
  });

  return NextResponse.json(
    { id: skillVersion.id, version, changelog: skillVersion.changelog },
    { status: 201 }
  );
}
