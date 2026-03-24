import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Server,
  Bot,
  Download,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/skill-card";

export default async function HomePage() {
  const featuredSkills = await prisma.skill.findMany({
    where: { featured: true },
    include: { author: true },
    take: 6,
    orderBy: { downloads: "desc" },
  });

  const stats = {
    skills: await prisma.skill.count(),
    users: await prisma.user.count(),
    downloads: await prisma.skill.aggregate({ _sum: { downloads: true } }),
  };

  const categories = [
    { name: "Code Review", slug: "code-review", icon: Terminal, count: 0 },
    { name: "Testing", slug: "testing", icon: Shield, count: 0 },
    { name: "DevOps", slug: "devops", icon: Server, count: 0 },
    { name: "Data Pipeline", slug: "data-pipeline", icon: Bot, count: 0 },
    { name: "Security", slug: "security", icon: Shield, count: 0 },
    { name: "Productivity", slug: "productivity", icon: Zap, count: 0 },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)]">
              <Zap className="h-3.5 w-3.5" />
              The marketplace for the agentic era
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Discover & Share{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">
                AI Skills
              </span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              The registry for AI skills, MCP servers, and agent
              configurations. Discover verified tools from trusted publishers
              for Claude Code, Codex, Cursor, and more.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/browse"
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Browse Skills
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/publish"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-8 py-3.5 text-base font-semibold text-[var(--text)] hover:border-[var(--accent)]/40 transition-colors"
              >
                Publish a Skill
              </Link>
            </div>

            {/* Install snippet */}
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 font-mono text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--green)]">$</span> claude skill add
              code-reviewer
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-[var(--border)] px-4 py-8 sm:px-6">
          <div className="text-center">
            <div className="text-2xl font-bold sm:text-3xl">
              {stats.skills.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              Skills Listed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold sm:text-3xl">
              {stats.users.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              Publishers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold sm:text-3xl">
              {formatNumber(stats.downloads._sum.downloads || 0)}
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              Installs
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Skills</h2>
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
                sourceType={skill.sourceType}
                authorName={skill.author.name}
                authorImage={skill.author.image}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold">Browse by Category</h2>
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
                    Browse skills
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to list your skills?
            </h2>
            <p className="mb-8 text-lg text-[var(--text-secondary)]">
              Join the registry. List your AI skills and MCP servers.
              Reach developers and earn from your work.
            </p>
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Start Publishing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[var(--text-secondary)]">
              &copy; 2026 Skill Shope. The AI skills marketplace.
            </p>
            <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
              <Link href="/browse" className="hover:text-[var(--text)]">
                Browse
              </Link>
              <Link href="/publish" className="hover:text-[var(--text)]">
                Publish
              </Link>
              <Link href="/about" className="hover:text-[var(--text)]">
                About
              </Link>
              <Link href="/terms" className="hover:text-[var(--text)]">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[var(--text)]">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
