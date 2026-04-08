import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export default async function BlueprintPage({ params }: Props) {
  const { slug } = await params;
  const blueprint = await prisma.blueprint.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!blueprint) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/browse" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{blueprint.name}</h1>
      <p className="mt-2 text-[var(--text-secondary)]">{blueprint.description}</p>
      <p className="mt-4 text-2xl font-bold text-[var(--accent)]">
        {blueprint.isFree ? "Free" : `$${blueprint.price.toFixed(2)}`}
      </p>
      {blueprint.longDescription && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">About</h2>
          <p className="text-sm text-[var(--text-secondary)]">{blueprint.longDescription}</p>
        </div>
      )}
      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        Full detail page coming soon.
      </p>
    </div>
  );
}
