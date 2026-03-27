import Link from "next/link";
import { Reveal } from "@/components/reveal";
import {
  ArrowRight,
  Terminal,
  Server,
  Bot,
  Shield,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/skill-card";
import { Aurora } from "@/components/aurora";
import { HeroSearch } from "@/components/hero-search";
import { Logo } from "@/components/logo";
import { CopyButton } from "@/components/copy-button";

export default async function HomePage() {
  const featuredSkills = await prisma.skill.findMany({
    where: { featured: true, reviewStatus: { in: ["approved", "pending"] } },
    include: { author: true },
    take: 6,
    orderBy: { downloads: "desc" },
  });

  const featuredCommand = "npx skillshope install skill-shope-publisher-guide";

  // Dynamic category counts
  const categoryCounts = await prisma.skill.groupBy({
    by: ["category"],
    where: { hidden: false, reviewStatus: { in: ["approved", "pending"] } },
    _count: true,
  });
  const countMap = Object.fromEntries(categoryCounts.map((c) => [c.category, c._count]));

  const categories = [
    { name: "Code Review", slug: "code-review", icon: Terminal, count: countMap["code-review"] || 0 },
    { name: "Testing", slug: "testing", icon: Shield, count: countMap["testing"] || 0 },
    { name: "DevOps", slug: "devops", icon: Server, count: countMap["devops"] || 0 },
    { name: "Data Pipeline", slug: "data-pipeline", icon: Bot, count: countMap["data-pipeline"] || 0 },
    { name: "Security", slug: "security", icon: Shield, count: countMap["security"] || 0 },
    { name: "Productivity", slug: "productivity", icon: Zap, count: countMap["productivity"] || 0 },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <Aurora />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)]">
              <Zap className="h-3.5 w-3.5" />
              Stop giving your tools away for free
            </div>
            <h1 className="font-hero mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              You built it.{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-[#8a9a7b] bg-clip-text text-transparent">
                Now get paid for it.
              </span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              The giants ship models. You build the tools that make them useful.
              Skill Shope is where your AI skills, MCP servers, and agents earn
              what they deserve — distributed in one command, protected by default.
            </p>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured install command */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-5 sm:px-6">
          <Terminal className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          <code className="font-mono text-sm text-[var(--text)]">{featuredCommand}</code>
          <CopyButton text={featuredCommand} />
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Featured Skills</h2>
            <Link
              href="/browse"
              className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((skill) => (
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
                lastUpdated={skill.lastUpdated?.toISOString() ?? null}
                variant="featured"
                originalAuthor={skill.originalAuthor}
                authorName={skill.author.name}
                authorImage={skill.author.image}
              />
            ))}
          </div>
          </Reveal>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
        <h2 className="font-display mb-8 text-2xl font-bold">Browse by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/browse?category=${cat.slug}`}>
              <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                  <cat.icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {cat.count} {cat.count === 1 ? "skill" : "skills"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Reveal>
          <h2 className="font-display mb-8 text-center text-2xl font-bold">
            Common questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "How is this different from GitHub?",
                a: "GitHub hosts code. We handle discovery, security verification, paid distribution with IP protection, and one-command installs. Your users don't need to clone repos or read READMEs.",
              },
              {
                q: "Why not just use an official vendor repo?",
                a: "You can. But you can't charge for your work, get install analytics, or control distribution. Skill Shope gives you the creator economics that vendor repos don't.",
              },
              {
                q: "How much do I keep?",
                a: "85% of every sale. Publishing is free. We only take a 15% platform fee when you make a paid sale. Free skills cost you nothing.",
              },
              {
                q: "Is my paid content protected?",
                a: "Yes. Paid skills are delivered via time-limited, cryptographically-signed download tokens. The code is never exposed publicly. You set the price, we protect the distribution.",
              },
              {
                q: "What tools are supported?",
                a: "Claude Code, Codex, Cursor, Windsurf, and any MCP-compatible AI assistant. Skills are vendor-neutral and cross-platform.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-colors open:border-[var(--accent)]/30"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-lg text-[var(--text-secondary)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            More questions?{" "}
            <Link href="/docs/faq" className="text-[var(--accent)] hover:underline">
              See the full FAQ
            </Link>
          </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)]">
        <Reveal>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display mb-4 text-3xl font-bold">
              Your code. Your rules. Your revenue.
            </h2>
            <p className="mb-4 text-lg text-[var(--text-secondary)]">
              Every skill you publish stays yours. Set your price — or give it away.
              We handle distribution, security scanning, and payouts. You keep 85%.
              The giants keep zero.
            </p>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">
              Free to publish. No approval queue. Live in minutes.
            </p>
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Start Earning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        </Reveal>
      </section>

    </div>
  );
}
