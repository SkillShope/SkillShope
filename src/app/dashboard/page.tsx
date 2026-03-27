import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { PUBLISHER_PAYOUT_PERCENT } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [user, skills, reviews, purchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccountId: true },
    }),
    prisma.skill.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { skill: { authorId: session.user.id } },
      include: {
        user: { select: { name: true } },
        skill: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.purchase.findMany({
      where: { userId: session.user.id },
      include: { skill: { select: { name: true, slug: true, installCmd: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalDownloads = skills.reduce((sum, s) => sum + s.downloads, 0);
  const avgRating =
    skills.length > 0
      ? skills.reduce((sum, s) => sum + s.rating, 0) / skills.length
      : 0;

  // Revenue = purchases of skills this user authored (money earned, not spent)
  const sales = await prisma.purchase.findMany({
    where: { skill: { authorId: session.user.id } },
    select: { amount: true },
  });
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount * (PUBLISHER_PAYOUT_PERCENT / 100), 0);

  const hasStripe = !!user?.stripeAccountId;

  return (
    <DashboardClient
      skills={skills.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        type: s.type,
        downloads: s.downloads,
        rating: s.rating,
        isFree: s.isFree,
        price: s.price,
        hidden: s.hidden,
      }))}
      reviews={reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user.name || "Anonymous",
        skillName: r.skill.name,
      }))}
      purchases={purchases.map((p) => ({
        skillName: p.skill.name,
        skillSlug: p.skill.slug,
        installCmd: p.skill.installCmd,
      }))}
      stats={{
        totalDownloads,
        avgRating,
        skillCount: skills.length,
        totalRevenue,
      }}
      hasStripe={hasStripe}
    />
  );
}
