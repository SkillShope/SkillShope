import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PublishPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <h1 className="text-3xl font-bold">Sell a Blueprint</h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        Publishing form coming soon. You&apos;ll be able to upload PDFs, Excel files, and more.
      </p>
    </div>
  );
}
