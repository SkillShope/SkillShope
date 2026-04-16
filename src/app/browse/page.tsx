import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlueprintCard } from "@/components/blueprint-card";
import { BLUEPRINT_CATEGORIES, BLUEPRINT_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Browse Templates",
  description:
    "Browse plumbing templates -- estimating sheets, service checklists, contracts, training materials, and more.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    region?: string;
    pricing?: string;
    sort?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, category, type, region, pricing, sort } = params;

  const where: Record<string, unknown> = { hidden: false };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (type) where.type = type;
  if (region) where.region = { contains: region, mode: "insensitive" };
  if (pricing === "free") where.isFree = true;
  if (pricing === "paid") where.isFree = false;

  const orderBy =
    sort === "price-low"
      ? { price: "asc" as const }
      : sort === "price-high"
        ? { price: "desc" as const }
        : sort === "most-downloaded"
          ? { downloads: "desc" as const }
          : { createdAt: "desc" as const }; // newest (default)

  const blueprints = await prisma.blueprint.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, image: true, showAvatar: true } },
    },
    orderBy,
    take: 50,
  });

  const resultCount = blueprints.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Templates</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {resultCount} template{resultCount !== 1 ? "s" : ""} found
            {q ? ` for "${q}"` : ""}
            {category
              ? ` in ${BLUEPRINT_CATEGORIES.find((c) => c.value === category)?.label ?? category}`
              : ""}
          </p>
        </div>
        <Link
          href="/publish"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Sell a Template
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-8 flex flex-wrap gap-3">
        {/* Search */}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search templates…"
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-56"
        />

        {/* Category */}
        <select
          name="category"
          defaultValue={category ?? ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">All Categories</option>
          {BLUEPRINT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          name="type"
          defaultValue={type ?? ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">All Types</option>
          {BLUEPRINT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Region */}
        <input
          type="text"
          name="region"
          defaultValue={region}
          placeholder="Region (e.g. Texas)"
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-44"
        />

        {/* Pricing */}
        <select
          name="pricing"
          defaultValue={pricing ?? ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">Any Price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        {/* Sort */}
        <select
          name="sort"
          defaultValue={sort ?? ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">Newest</option>
          <option value="most-downloaded">Most Downloaded</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        <button
          type="submit"
          className="h-9 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Apply
        </button>

        {(q || category || type || region || pricing || sort) && (
          <a
            href="/browse"
            className="h-9 inline-flex items-center rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Results */}
      {blueprints.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            No templates found. Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((blueprint) => (
            <BlueprintCard
              key={blueprint.id}
              slug={blueprint.slug}
              name={blueprint.name}
              description={blueprint.description}
              category={blueprint.category}
              type={blueprint.type}
              price={blueprint.price}
              isFree={blueprint.isFree}
              downloads={blueprint.downloads}
              region={blueprint.region}
              authorName={blueprint.author.name}
              authorImage={blueprint.author.showAvatar ? blueprint.author.image : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
