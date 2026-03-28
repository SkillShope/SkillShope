import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SkillCard } from "@/components/skill-card";
import { SearchFilters } from "@/components/search-filters";
import Link from "next/link";
import { Terminal, Server, Bot, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Skills",
  description:
    "Browse AI skills, MCP servers, agent configurations, and curated bundles. Filter by category, type, and sort by downloads, rating, or price.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; listing?: string; owned?: string; view?: string; pricing?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, category, type, sort, listing, owned, view, pricing } = params;
  const session = await auth();

  const where: Record<string, unknown> = {
    reviewStatus: { in: ["approved", "pending"] }, // Show approved + legacy pending until backfill
    hidden: false,
  };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (type) where.type = type;
  if (listing === "community") where.listingType = "community";
  if (listing === "original") where.listingType = "original";
  if (pricing === "free") where.isFree = true;
  if (pricing === "premium") where.isFree = false;

  // Filter to only purchased skills
  if (owned === "true" && session?.user?.id) {
    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id },
      select: { skillId: true },
    });
    where.id = { in: purchases.map((p) => p.skillId) };
  }

  let orderBy: Record<string, string> = {};
  if (sort === "downloads") orderBy = { downloads: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "price-low") orderBy = { price: "asc" };
  else if (sort === "price-high") orderBy = { price: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const rawSkills = await prisma.skill.findMany({
    where,
    include: { author: true },
    ...(Object.keys(orderBy).length > 0 ? { orderBy } : {}),
    take: 50,
  });

  // Default sort: skills with GitHub stars first (highest to lowest), then the rest by newest
  const skills = Object.keys(orderBy).length > 0
    ? rawSkills
    : rawSkills.sort((a, b) => {
        const aStars = a.githubStars ?? -1;
        const bStars = b.githubStars ?? -1;
        if (aStars > 0 && bStars <= 0) return -1;
        if (bStars > 0 && aStars <= 0) return 1;
        if (aStars > 0 && bStars > 0) return bStars - aStars;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

  const categories = await prisma.skill.groupBy({
    by: ["category"],
    _count: true,
  });

  // Fetch bundles when in bundles view
  const bundleWhere: Record<string, unknown> = {};
  if (q) {
    bundleWhere.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (pricing === "free") bundleWhere.isFree = true;
  if (pricing === "premium") bundleWhere.isFree = false;

  const bundles = view === "bundles" ? await prisma.bundle.findMany({
    where: Object.keys(bundleWhere).length > 0 ? bundleWhere : undefined,
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
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  }) : [];

  const typeIcons: Record<string, typeof Terminal> = {
    skill: Terminal,
    "mcp-server": Server,
    agent: Bot,
  };

  const isBundlesView = view === "bundles";
  const resultCount = isBundlesView ? bundles.length : skills.length;
  const resultLabel = isBundlesView ? "bundle" : "skill";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse {isBundlesView ? "Bundles" : "Skills"}</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {resultCount} {resultLabel}{resultCount !== 1 ? "s" : ""} found
          {q ? ` for "${q}"` : ""}
          {category ? ` in ${category}` : ""}
        </p>
      </div>

      <SearchFilters
        categories={categories.map((c) => ({
          name: c.category,
          count: c._count,
        }))}
        currentQuery={q}
        currentCategory={category}
        currentType={type}
        currentSort={sort}
        currentListing={listing}
        currentOwned={owned}
        currentView={view}
        currentPricing={pricing}
        isSignedIn={!!session?.user}
      />

      {isBundlesView ? (
        bundles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-[var(--text-secondary)]">
              No bundles found.{q ? " Try a different search." : ""}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <Link key={bundle.id} href={`/bundles/${bundle.slug}`}>
                <div className="card-hover group flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                      Bundle &middot; {bundle.skills.length} skills
                    </span>
                    {bundle.featured && (
                      <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                    )}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold group-hover:text-[var(--accent)] transition-colors">
                    {bundle.name}
                  </h3>
                  <p className="mb-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {bundle.description}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {bundle.skills.slice(0, 4).map((bs) => {
                      const Icon = typeIcons[bs.skill.type] || Terminal;
                      return (
                        <span key={bs.skill.slug} className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                          <Icon className="h-3 w-3" />
                          {bs.skill.name}
                        </span>
                      );
                    })}
                    {bundle.skills.length > 4 && (
                      <span className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                        +{bundle.skills.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className="text-xs text-[var(--text-secondary)]">
                      by {bundle.author.name || "Anonymous"}
                    </span>
                    <span className={`text-sm font-semibold ${bundle.isFree ? "text-[var(--green)]" : "text-[var(--text)]"}`}>
                      {bundle.isFree ? "Free" : `$${bundle.price.toFixed(2)}`}
                      {bundle.discount && !bundle.isFree && (
                        <span className="ml-1 text-xs text-[var(--green)]">-{bundle.discount}%</span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : skills.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            No skills found. Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              slug={skill.slug}
              name={skill.name}
              description={skill.description}
              category={skill.category}
              type={skill.type}
              price={skill.price}
              isFree={skill.isFree}
              downloads={skill.downloads}
              rating={skill.rating}
              reviewCount={skill.reviewCount}
              compatibility={skill.compatibility}
              verified={skill.verified}
              reviewStatus={skill.reviewStatus}
              securityScore={skill.securityScore}
              sourceType={skill.sourceType}
              listingType={skill.listingType}
              githubStars={skill.githubStars}
              githubForks={skill.githubForks}
              lastUpdated={skill.lastUpdated?.toISOString() ?? null}
              originalAuthor={skill.originalAuthor}
              authorName={skill.author.name}
              authorImage={skill.author.showAvatar ? skill.author.image : null}
              estimatedTokens={skill.estimatedTokens}
            />
          ))}
        </div>
      )}
    </div>
  );
}
