// Project Management API
// GET /api/projects — list user's projects
// POST /api/projects — create a project
// PATCH /api/projects — add/remove skill from project

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitize } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      skills: {
        include: {
          skill: {
            select: { slug: true, name: true, type: true, description: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: sanitize(name).slice(0, 100),
      description: description ? sanitize(description).slice(0, 500) : null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, skillSlug, action } = await req.json();

  if (!projectId || !skillSlug || !action) {
    return NextResponse.json({ error: "projectId, skillSlug, and action required" }, { status: 400 });
  }

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  if (action === "add") {
    await prisma.projectSkill.upsert({
      where: { projectId_skillId: { projectId, skillId: skill.id } },
      create: { projectId, skillId: skill.id },
      update: {},
    });
  } else if (action === "remove") {
    await prisma.projectSkill.deleteMany({
      where: { projectId, skillId: skill.id },
    });
  }

  return NextResponse.json({ success: true });
}
