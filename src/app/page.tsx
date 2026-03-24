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
  CreditCard,
  Star,
  Lock,
  Code,
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
    { name: "Code Review", slug: "code-review", icon: Terminal, desc: "Automated reviews, linting, and best practices" },
    { name: "Testing", slug: "testing", icon: Shield, desc: "Test generation, coverage, and QA automation" },
    { name: "DevOps", slug: "devops", icon: Server, desc: "CI/CD, deployment, and infrastructure tools" },
    { name: "Data Pipeline", slug: "data-pipeline", icon: Bot, desc: "ETL, data processing, and analytics" },
    { name: "Security", slug: "security", icon: Lock, desc: "Vulnerability scanning, audits, and compliance" },
    { name: "API", slug: "api", icon: Code, desc: "API generation, documentation, and testing" },
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
              The registry for the agentic era
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Install AI superpowers{" "}
              <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">
                in one command
              </span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              The place developers go to find skills, MCP servers, and agents
              for their AI coding tools. Verified by the community. Installed
              from the terminal.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/browse"
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Explore the Registry
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/publish"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-8 py-3.5 text-base font-semibold text-[var(--text)] hover:border-[var(--accent)]/40 transition-colors"
              >
                Publish & Earn
              </Link>
            </div>

            {/* Install snippet */}
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 font-mono text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--green)]">$</span> npx skillshope
              install mcp-forge
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

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">From discovery to install in 30 seconds</h2>
          <p className="text-[var(--text-secondary)]">
            No config files. No dependency hell. Find what you need, install it, and move on.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Find",
              desc: "Search by category, tool, or keyword. Every listing is reviewed and rated by developers who've actually used it.",
              icon: Star,
            },
            {
              step: "02",
              title: "Install",
              desc: "One command. That's it. Free skills install instantly. Paid skills unlock after a quick Stripe checkout.",
              icon: Terminal,
            },
            {
              step: "03",
              title: "Build",
              desc: "Your AI assistant just got smarter. Use your new skills with Claude Code, Codex, Cursor, or any MCP-compatible tool.",
              icon: Zap,
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                <item.icon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                Step {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Skills */}
      {featuredSkills.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Featured</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Hand-picked by the Skill Shope team
                </p>
              </div>
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
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-2 text-2xl font-bold">Browse by Category</h2>
        <p className="mb-8 text-sm text-[var(--text-secondary)]">
          Whatever you&apos;re building, there&apos;s a skill for it.
        </p>
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
                    {cat.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Publisher CTA */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold">
                You build the tools.<br />
                We bring the developers.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[var(--text-secondary)]">
                List your AI skills, MCP servers, and agent configs on Skill
                Shope. Set your price, connect Stripe, and start earning. You
                keep 85% of every sale.
              </p>
              <div className="space-y-4">
                {[
                  { icon: CreditCard, text: "Automatic payouts via Stripe Connect" },
                  { icon: Shield, text: "Verified publisher badges build buyer trust" },
                  { icon: Download, text: "CLI distribution — one command to install" },
                  { icon: Users, text: "Reach developers on Claude Code, Codex, Cursor, and more" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/publish"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Start Publishing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                How publishers earn
              </div>
              <div className="space-y-4">
                {[
                  { label: "Skill priced at", value: "$9.99" },
                  { label: "Stripe processing", value: "-$0.59" },
                  { label: "Platform fee (15%)", value: "-$1.50" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {row.label}
                    </span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">You receive</span>
                    <span className="text-2xl font-bold text-[var(--green)]">
                      $7.90
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Per sale, deposited automatically to your bank account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[var(--text-secondary)]">
              &copy; 2026 Skill Shope. Built for the developers shaping the AI era.
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
