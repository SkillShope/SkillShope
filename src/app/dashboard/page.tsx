import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Download, FileText, Plus, Calendar, Package, Sparkles, ScrollText, ChevronRight } from "lucide-react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      blueprint: {
        include: {
          files: { select: { id: true, filename: true, size: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const myBlueprints = await prisma.blueprint.findMany({
    where: { authorId: session.user.id },
    include: { files: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const estimates = await prisma.estimate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, estimateNumber: true, jobDescription: true, jobType: true, data: true, contractData: true, createdAt: true },
  });

  const estimatesWithTotals = estimates.map((e) => ({
    ...e,
    total: (JSON.parse(e.data) as { total: number }).total,
    hasContract: !!e.contractData,
  }));

  const contracts = estimatesWithTotals.filter((e) => e.hasContract);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-12">
      <h1 className="text-3xl font-bold">My Library</h1>

      {/* Section 1: Purchased Blueprints */}
      <section>
        <h2 className="text-xl font-semibold mb-4">My Purchased Templates</h2>

        {purchases.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {purchases.map((purchase) => {
              const bp = purchase.blueprint;
              const totalSize = bp.files.reduce((sum, f) => sum + f.size, 0);
              return (
                <div
                  key={purchase.id}
                  className="rounded-xl border bg-card p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/blueprints/${bp.slug}`}
                      className="font-semibold text-lg hover:underline leading-snug"
                    >
                      {bp.name}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(purchase.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {bp.files.length} {bp.files.length === 1 ? "file" : "files"}
                      </span>
                      {totalSize > 0 && (
                        <span>{formatFileSize(totalSize)}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/api/deliver/${bp.id}`}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-white font-semibold py-3 w-full hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center space-y-4">
            <Package className="w-10 h-10 mx-auto text-[var(--text-secondary)]" />
            <p className="text-[var(--text-secondary)]">
              No blueprints purchased yet.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-white font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              Browse Templates
            </Link>
          </div>
        )}
      </section>

      {/* Section 2: Estimates (only if any) */}
      {estimatesWithTotals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Estimates</h2>
            <Link
              href="/estimate"
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Estimate
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-xl border">
            {estimatesWithTotals.map((est) => (
              <Link
                key={est.id}
                href={`/estimate/${est.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-card)] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {est.estimateNumber && <span className="mr-2 text-[var(--text-secondary)]">{est.estimateNumber}</span>}
                    {est.jobDescription}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(est.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {est.jobType}
                    </span>
                    {est.hasContract && (
                      <span className="flex items-center gap-1 text-[var(--accent)]">
                        <ScrollText className="w-3.5 h-3.5" />
                        Contract
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    ${est.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Contracts (only if any) */}
      {contracts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">My Contracts</h2>

          <div className="divide-y divide-[var(--border)] rounded-xl border">
            {contracts.map((est) => (
              <Link
                key={est.id}
                href={`/estimate/${est.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-card)] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{est.jobDescription}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(est.createdAt)}
                    </span>
                    <span className="font-semibold">
                      ${est.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <Download className="h-4 w-4 text-[var(--text-secondary)]" />
                  <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Published Blueprints (only if any) */}
      {myBlueprints.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Published Templates</h2>
            <Link
              href="/publish"
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Sell a Template
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {myBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="rounded-xl border bg-card p-5 flex flex-col gap-3"
              >
                <Link
                  href={`/blueprints/${bp.slug}`}
                  className="font-semibold text-lg hover:underline leading-snug"
                >
                  {bp.name}
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">
                    {bp.isFree ? "Free" : `$${bp.price.toFixed(2)}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {bp.downloads} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {bp.files.length} {bp.files.length === 1 ? "file" : "files"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(bp.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
