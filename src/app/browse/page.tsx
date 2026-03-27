import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SkillCard } from "@/components/skill-card";
import { SearchFilters } from "@/components/search-filters";

export const metadata: Metadata = {
  title: "Browse Skills",
  description:
    "Browse AI skills, MCP servers, and agent configurations. Filter by category, type, and sort by downloads, rating, or price.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; listing?: string; owned?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, category, type, sort, listing, owned } = params;
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Skills</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {skills.length} skill{skills.length !== 1 ? "s" : ""} found
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
        isSignedIn={!!session?.user}
      />

      {skills.length === 0 ? (
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
              authorImage={skill.author.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
