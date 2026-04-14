import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EstimateTool } from "@/components/estimate-tool";
import { prisma } from "@/lib/prisma";
import { FREE_ESTIMATE_LIMIT, PRO_ESTIMATE_LIMIT } from "@/lib/estimate";

export const metadata: Metadata = {
  title: "AI Estimate Generator - RoughInHub",
  description:
    "Generate professional plumbing estimates in 60 seconds. Describe the job, get an itemized bid with materials, labor, and markup. Download as PDF.",
};

export default async function EstimatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/estimate");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionStatus: true,
      businessName: true,
      businessPhone: true,
      businessEmail: true,
      licenseNumber: true,
    },
  });

  const isPro = user?.subscriptionStatus === "active";

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await prisma.estimate.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfMonth },
    },
  });

  const recentEstimates = await prisma.estimate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      jobDescription: true,
      jobType: true,
      data: true,
      createdAt: true,
    },
  });

  return (
    <EstimateTool
      isPro={isPro}
      usage={{ used: monthlyCount, limit: isPro ? PRO_ESTIMATE_LIMIT : FREE_ESTIMATE_LIMIT }}
      businessProfile={{
        businessName: user?.businessName || "",
        businessPhone: user?.businessPhone || "",
        businessEmail: user?.businessEmail || "",
        licenseNumber: user?.licenseNumber || "",
      }}
      recentEstimates={recentEstimates.map((e) => ({
        id: e.id,
        jobDescription: e.jobDescription,
        jobType: e.jobType,
        total: JSON.parse(e.data).total,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
