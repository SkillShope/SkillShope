import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/auth/signin");

  return (
    <ProfileForm
      name={user.name || ""}
      email={user.email || ""}
      image={user.image || null}
      bio={user.bio || ""}
      joinedAt={user.createdAt.toISOString()}
    />
  );
}
