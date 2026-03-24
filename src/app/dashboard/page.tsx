"use client";

import {
  Terminal,
  Server,
  Bot,
  Star,
  Download,
  Eye,
  Plus,
  TrendingUp,
  Check,
  Copy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ConnectBanner } from "@/components/connect-banner";

// Placeholder data for UI review
const mockUser = {
  name: "Demo Author",
  email: "demo@skillshope.dev",
  image: null,
  bio: "AI tooling enthusiast and open source contributor.",
  joinedAt: "2025-09-15",
};

const mockSkills = [
  {
    id: "1",
    slug: "code-reviewer",
    name: "Code Reviewer",
    type: "skill",
    downloads: 2340,
    rating: 4.7,
    reviewCount: 18,
    isFree: true,
    price: 0,
    createdAt: "2025-10-01",
  },
  {
    id: "2",
    slug: "postgres-mcp",
    name: "Postgres MCP Server",
    type: "mcp-server",
    downloads: 5120,
    rating: 4.9,
    reviewCount: 42,
    isFree: true,
    price: 0,
    createdAt: "2025-11-12",
  },
  {
    id: "3",
    slug: "deploy-agent",
    name: "Deploy Agent",
    type: "agent",
    downloads: 870,
    rating: 4.5,
    reviewCount: 11,
    isFree: false,
    price: 9.99,
    createdAt: "2026-01-05",
  },
];

const typeIcons: Record<string, typeof Terminal> = {
  skill: Terminal,
  "mcp-server": Server,
  agent: Bot,
};

const stats = [
  { label: "Total Downloads", value: "8,330", icon: Download },
  { label: "Avg Rating", value: "4.7", icon: Star },
  { label: "Total Views", value: "24.1k", icon: Eye },
  { label: "Revenue", value: "$142.50", icon: TrendingUp },
];

// Mock install commands by slug
const installCommands: Record<string, string> = {
  "deploy-agent": "claude agent install deploy-agent",
  "figma-mcp": "npx @skillshope/figma-mcp",
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const purchasedSlug = searchParams.get("purchased");
  const [showBanner, setShowBanner] = useState(!!purchasedSlug);

  const purchasedSkill = purchasedSlug
    ? mockSkills.find((s) => s.slug === purchasedSlug) ?? {
        name: purchasedSlug,
        slug: purchasedSlug,
      }
    : null;

  const installCmd =
    purchasedSlug && installCommands[purchasedSlug]
      ? installCommands[purchasedSlug]
      : `npx skill-shope install ${purchasedSlug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Purchase success banner */}
      {showBanner && purchasedSkill && (
        <div className="mb-8 rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/15">
                <Check className="h-4 w-4 text-[var(--green)]" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {purchasedSkill.name} is ready to install
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Run the command below to get started.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm">
                  <code className="text-[var(--green)]">{installCmd}</code>
                  <CopyButton text={installCmd} />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stripe Connect */}
      <div className="mb-8">
        <ConnectBanner />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your published skills and track performance.
          </p>
        </div>
        <Link
          href="/publish"
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Skill
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Skills table */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Your Skills</h2>
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Skill
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Downloads
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] md:table-cell">
                  Rating
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Price
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockSkills.map((skill) => {
                const Icon = typeIcons[skill.type] || Terminal;
                return (
                  <tr
                    key={skill.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/skills/${skill.slug}`}
                        className="font-medium hover:text-[var(--accent)]"
                      >
                        {skill.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs">
                        <Icon className="h-3 w-3" />
                        {skill.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {skill.downloads.toLocaleString()}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[var(--yellow)] text-[var(--yellow)]" />
                        {skill.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          skill.isFree
                            ? "text-[var(--green)]"
                            : "text-[var(--text)]"
                        }
                      >
                        {skill.isFree ? "Free" : `$${skill.price.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-md px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Recent Reviews</h2>
        <div className="space-y-3">
          {[
            {
              skill: "Postgres MCP Server",
              user: "Sarah K.",
              rating: 5,
              comment: "Best MCP server I've used. Setup was effortless.",
            },
            {
              skill: "Code Reviewer",
              user: "Alex M.",
              rating: 4,
              comment:
                "Solid code review suggestions. Would love Go support.",
            },
            {
              skill: "Deploy Agent",
              user: "Jordan L.",
              rating: 5,
              comment: "Saved us hours on deployments. Worth every penny.",
            },
          ].map((review, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{review.user}</span>
                  <span className="mx-2 text-[var(--text-secondary)]">on</span>
                  <span className="text-sm font-medium text-[var(--accent)]">
                    {review.skill}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-3.5 w-3.5 ${
                        j < review.rating
                          ? "fill-[var(--yellow)] text-[var(--yellow)]"
                          : "text-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
