import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstimateViewer } from "@/components/estimate-viewer";

export const metadata: Metadata = {
  title: "Estimate - RoughInHub",
};

type Props = { params: Promise<{ id: string }> };

export default async function EstimateDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/estimate");
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    notFound();
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

  return (
    <EstimateViewer
      id={estimate.id}
      estimateNumber={estimate.estimateNumber}
      jobDescription={estimate.jobDescription}
      data={JSON.parse(estimate.data)}
      contractData={estimate.contractData ? JSON.parse(estimate.contractData) : null}
      isPro={user?.subscriptionStatus === "active"}
      businessProfile={{
        businessName: user?.businessName || "",
        businessPhone: user?.businessPhone || "",
        businessEmail: user?.businessEmail || "",
        licenseNumber: user?.licenseNumber || "",
      }}
    />
  );
}
