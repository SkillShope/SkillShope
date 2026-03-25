"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, ShieldCheck } from "lucide-react";

type BundleSkill = {
  slug: string;
  name: string;
  type: string;
  isFree: boolean;
  price: number;
  securityScore: number | null;
};

type Bundle = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  isFree: boolean;
  discount: number | null;
  featured: boolean;
  authorName: string | null;
  skills: BundleSkill[];
};

export function BundlesList({ bundles }: { bundles: Bundle[] }) {
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filtered = bundles.filter((b) => {
    if (filter === "free") return b.isFree;
    if (filter === "premium") return !b.isFree;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Bundles</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Curated collections designed to work together. Install an entire stack in one go.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 w-fit">
        {([
          { label: "All", value: "all" as const },
          { label: "Free", value: "free" as const },
          { label: "Premium", value: "premium" as const },
        ]).map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === t.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-20 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
          <p className="font-medium">No {filter === "all" ? "" : filter} bundles yet</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bundle) => {
            const totalValue = bundle.skills.reduce(
              (sum, s) => sum + (s.isFree ? 0 : s.price), 0
            );

            return (
              <Link key={bundle.id} href={`/bundles/${bundle.slug}`}>
                <div className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                        {bundle.skills.length} tools
                      </span>
                      {!bundle.isFree && (
                        <span className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                          Premium
                        </span>
                      )}
                    </div>
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
                    {bundle.skills.slice(0, 4).map((s) => (
                      <span
                        key={s.slug}
                        className="flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
                      >
                        {s.securityScore != null && s.securityScore >= 90 && (
                          <ShieldCheck className="h-3 w-3 text-[var(--green)]" />
                        )}
                        {s.name}
                      </span>
                    ))}
                    {bundle.skills.length > 4 && (
                      <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                        +{bundle.skills.length - 4} more
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
