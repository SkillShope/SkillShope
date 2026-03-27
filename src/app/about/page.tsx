import type { Metadata } from "next";
import { Shield, Lock, Terminal, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Skill Shope is the independent registry where AI skill creators set their price, keep their IP, and get 85% of every sale.",
};

const values = [
  {
    icon: Shield,
    title: "Creators first",
    description:
      "85% payout on every sale. No approval queue. No gatekeepers. Publish and go live in minutes.",
  },
  {
    icon: Lock,
    title: "Your IP, protected",
    description:
      "Paid skills are delivered via time-limited download tokens. Your code is never exposed publicly.",
  },
  {
    icon: Terminal,
    title: "One command",
    description:
      "npx skillshope install <slug>. That's it. No cloning repos, no reading READMEs, no dependency hell.",
  },
  {
    icon: Globe,
    title: "Vendor neutral",
    description:
      "Works with Claude Code, Codex, Cursor, Windsurf, and any MCP-compatible client. No walled gardens.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          Built by a builder who got tired of building for free.
        </h1>
        <div className="space-y-4 text-lg leading-relaxed text-[var(--text-secondary)]">
          <p>
            You spend weeks building an AI skill that saves developers hours.
            You publish it on GitHub. A giant forks it, ships it in their
            marketplace, and you get a star.
          </p>
          <p>
            We think you deserve more than a star.
          </p>
        </div>
      </div>

      {/* The problem / solution */}
      <div className="mb-12 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-6">
        <h2 className="mb-3 text-xl font-bold">The deal</h2>
        <p className="leading-relaxed text-[var(--text-secondary)]">
          Skill Shope is the independent registry where creators set their price,
          keep their IP, and get 85% of every sale. One-command installs. Security
          scanning. Download token protection. Security scanned on publish. No vendor lock-in.
          Your work earns what it deserves.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-bold">How it works</h2>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Publish your skill",
              desc: "Import from GitHub or paste a URL. Set your price or keep it free. We run a security scan and you're live in minutes.",
            },
            {
              step: "2",
              title: "Developers find and install",
              desc: "Browse, search, read reviews. One command to install. Free skills are instant. Paid skills use download tokens — your code stays protected.",
            },
            {
              step: "3",
              title: "You get paid",
              desc: "85% of every sale hits your Stripe account directly. We handle the checkout, delivery, and support infrastructure. You keep building.",
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
        <h2 className="mb-6 text-xl font-bold">What we stand for</h2>
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
        <h2 className="mb-2 text-xl font-bold">Your code. Your rules. Your revenue.</h2>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          Whether you&apos;re looking for tools or building them — there&apos;s
          a place for you here. And if you built it, you should get paid for it.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/publish"
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Start Earning
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-semibold hover:border-[var(--accent)]/40 transition-colors"
          >
            Browse Skills
          </Link>
        </div>
      </div>
    </div>
  );
}
