import { auth } from "./auth";
import { prisma } from "./prisma";

// Returns the user if they are an admin, null otherwise
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  return user?.isAdmin ? session.user : null;
}
