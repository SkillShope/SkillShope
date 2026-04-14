import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) redirect("/");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalEstimates, monthlyEstimates, totalUsers] = await Promise.all([
    prisma.estimate.count(),
    prisma.estimate.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count(),
  ]);

  return (
    <AdminPanel
      stats={{
        totalEstimates,
        monthlyEstimates,
        totalUsers,
      }}
    />
  );
}
