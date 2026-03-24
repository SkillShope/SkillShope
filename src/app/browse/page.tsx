import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/skill-card";
import { SearchFilters } from "@/components/search-filters";

export const metadata: Metadata = {
  title: "Browse Skills",
  description:
    "Browse AI skills, MCP servers, and agent configurations. Filter by category, type, and sort by downloads, rating, or price.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; type?: string; sort?: string; listing?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, category, type, sort, listing } = params;

  const where: Record<string, unknown> = {
    reviewStatus: { in: ["approved", "pending"] }, // Show approved + legacy pending until backfill
  };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ];
  }
  if (category) where.category = category;
  if (type) where.type = type;
  if (listing === "community") where.listingType = "community";
  if (listing === "original") where.listingType = "original";

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "downloads") orderBy = { downloads: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  if (sort === "price-high") orderBy = { price: "desc" };

  const skills = await prisma.skill.findMany({
    where,
    include: { author: true },
    orderBy,
    take: 50,
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
        currentCategory={category}
        currentType={type}
        currentSort={sort}
        currentListing={listing}
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
