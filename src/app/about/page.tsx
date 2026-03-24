import type { Metadata } from "next";
import { Shield, Search, CreditCard, Users, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Skill Shope is the registry for AI skills, MCP servers, and agent configurations. We connect developers to tools — discover, review, and install from verified publishers.",
};

const values = [
  {
    icon: Search,
    title: "Discovery",
    description:
      "We make it easy to find the right AI tools. Search, filter, and browse skills curated by the community.",
  },
  {
    icon: Shield,
    title: "Trust",
    description:
      "Verified publishers, honest reviews, and transparent ratings so you know what you're installing.",
  },
  {
    icon: CreditCard,
    title: "Fair Monetization",
    description:
      "Publishers set their own prices. We handle payments so builders can focus on building.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "A growing ecosystem of developers sharing tools for Claude Code, Codex, Cursor, and more.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)]">
          <Zap className="h-3.5 w-3.5" />
          About Skill Shope
        </div>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          The registry for the agentic era
        </h1>
        <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
          Skill Shope is where developers discover, review, and install AI
          skills, MCP servers, and agent configurations. We don&apos;t host
          the tools — we connect you to them. Think of us as the catalog,
          not the warehouse.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-bold">How it works</h2>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Publishers list their tools",
              desc: "Point to a GitHub repo, npm package, or any URL. Add a description, install command, and set a price (or keep it free).",
            },
            {
              step: "2",
              title: "Developers discover and review",
              desc: "Browse by category, search by keyword, read reviews from other developers. Find the right tool fast.",
            },
            {
              step: "3",
              title: "Install from the source",
              desc: "Copy the install command and run it in your terminal. The tool comes directly from the publisher — we just helped you find it.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-bold">What we care about</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
            >
              <v.icon className="mb-3 h-5 w-5 text-[var(--accent)]" />
              <h3 className="mb-1 font-semibold">{v.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <h2 className="mb-2 text-xl font-bold">Join the registry</h2>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          Whether you&apos;re looking for tools or building them, there&apos;s
          a place for you here.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/browse"
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse Skills
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/publish"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-semibold hover:border-[var(--accent)]/40 transition-colors"
          >
            Start Publishing
          </Link>
        </div>
      </div>
    </div>
  );
}
