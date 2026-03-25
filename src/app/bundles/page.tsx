import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Curated bundles of AI skills, MCP servers, and agents for common goals.",
};

export default async function BundlesPage() {
  const bundles = await prisma.bundle.findMany({
    include: {
      skills: {
        include: {
          skill: {
            select: { slug: true, name: true, type: true, isFree: true, price: true, securityScore: true },
          },
        },
      },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Bundles</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Curated collections of skills, MCP servers, and agents — designed to work together.
          Install an entire stack in one go.
        </p>
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
          <p className="font-medium">No bundles yet</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Curated bundles are coming soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => {
            const skillCount = bundle.skills.length;
            const totalValue = bundle.skills.reduce(
              (sum, bs) => sum + (bs.skill.isFree ? 0 : bs.skill.price),
              0
            );

            return (
              <Link key={bundle.id} href={`/bundles/${bundle.slug}`}>
                <div className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                      {skillCount} tools
                    </span>
                    {bundle.discount && (
                      <span className="rounded-full bg-[var(--green)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--green)]">
                        {bundle.discount}% off
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 text-lg font-bold group-hover:text-[var(--accent)] transition-colors">
                    {bundle.name}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {bundle.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {bundle.skills.slice(0, 4).map((bs) => (
                      <span
                        key={bs.skill.slug}
                        className="flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
                      >
                        {bs.skill.securityScore != null && bs.skill.securityScore >= 90 && (
                          <ShieldCheck className="h-3 w-3 text-[var(--green)]" />
                        )}
                        {bs.skill.name}
                      </span>
                    ))}
                    {skillCount > 4 && (
                      <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                        +{skillCount - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className={`text-sm font-semibold ${bundle.isFree ? "text-[var(--green)]" : ""}`}>
                      {bundle.isFree ? "Free" : `$${bundle.price.toFixed(2)}`}
                      {!bundle.isFree && totalValue > bundle.price && (
                        <span className="ml-2 text-xs font-normal text-[var(--text-secondary)] line-through">
                          ${totalValue.toFixed(2)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                      View bundle <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
