import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProUpgrade } from "@/components/pro-upgrade";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "RoughInHub Pro - AI Estimates + Contracts",
  description: "30 AI estimates/month plus one-click contract generation. $19/month.",
};

export default async function ProPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/estimate/pro");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  });

  if (user?.subscriptionStatus === "active") {
    redirect("/estimate");
  }

  return <ProUpgrade />;
}
