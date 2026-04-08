import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Library</h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        Your purchased blueprints will appear here. Coming soon.
      </p>
    </div>
  );
}
