import { redirect } from "next/navigation";

export default function BundlesPage() {
  redirect("/browse?view=bundles");
}
