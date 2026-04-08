import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PublishForm } from "@/components/publish-form";

export default async function PublishPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return <PublishForm />;
}
