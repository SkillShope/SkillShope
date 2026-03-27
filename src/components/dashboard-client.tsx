"use client";

import {
  Terminal,
  Server,
  Bot,
  Star,
  Download,
  Plus,
  TrendingUp,
  Check,
  X,
  Package,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ConnectBanner } from "@/components/connect-banner";

type Skill = {
  id: string;
  slug: string;
  name: string;
  type: string;
  downloads: number;
  rating: number;
  isFree: boolean;
  price: number;
  hidden: boolean;
  installs7d: number;
  installsBySource: Record<string, number>;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  skillName: string;
};

type Purchase = {
  skillName: string;
  skillSlug: string;
  installCmd: string | null;
};

type Stats = {
  totalDownloads: number;
  avgRating: number;
  skillCount: number;
  totalRevenue: number;
};

const typeIcons: Record<string, typeof Terminal> = {
  skill: Terminal,
  "mcp-server": Server,
  agent: Bot,
};

export function DashboardClient({
  skills: initialSkills,
  reviews,
  purchases,
  stats,
  hasStripe,
}: {
  skills: Skill[];
  reviews: Review[];
  purchases: Purchase[];
  stats: Stats;
  hasStripe: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const purchasedSlug = searchParams.get("purchased");
  const [showBanner, setShowBanner] = useState(!!purchasedSlug);
  const [skillSearch, setSkillSearch] = useState("");
  const [skills, setSkills] = useState(initialSkills);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const purchasedSkill = purchasedSlug
    ? purchases.find((p) => p.skillSlug === purchasedSlug) ?? {
        skillName: purchasedSlug,
        skillSlug: purchasedSlug,
        installCmd: null,
      }
    : null;

  const hiddenCount = skills.filter((s) => s.hidden).length;

  const toggleVisibility = async (id: string, hidden: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      if (res.ok) {
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, hidden } : s)));
      }
    } catch {}
    setActionLoading(null);
  };

  const deleteSkill = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        setConfirmDelete(null);
        router.refresh();
      }
    } catch {}
    setActionLoading(null);
  };

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
                  {purchasedSkill.skillName} is ready to install
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Run the command below to get started.
                </p>
                {purchasedSkill.installCmd && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm">
                    <code className="text-[var(--green)]">
                      {purchasedSkill.installCmd}
                    </code>
                    <CopyButton text={purchasedSkill.installCmd} />
                  </div>
                )}
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

      {/* Hidden skills warning — only show if user has skills but no Stripe */}
      {!hasStripe && hiddenCount > 0 && (
        <div className="mb-8 rounded-xl border border-[var(--yellow)]/30 bg-[var(--yellow)]/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--yellow)]" />
            <div>
              <p className="text-sm font-medium">
                {hiddenCount} skill{hiddenCount !== 1 ? "s" : ""} hidden from the public
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Connect your Stripe account above to make your skills visible and offer paid products.
                Until then, all your skills are hidden from the browse page and set to free.
              </p>
            </div>
          </div>
        </div>
      )}

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
        {[
          { label: "Published Skills", value: stats.skillCount.toString(), icon: Package },
          { label: "Total Downloads", value: stats.totalDownloads.toLocaleString(), icon: Download },
          { label: "Avg Rating", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", icon: Star },
          { label: "Revenue", value: stats.totalRevenue > 0 ? `$${stats.totalRevenue.toFixed(2)}` : "$0.00", icon: TrendingUp },
        ].map((stat) => (
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

      {/* Your Skills */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Your Skills</h2>
          {skills.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Filter skills..."
                className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-1.5 pl-8 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>
        {skills.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-12 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
            <p className="font-medium">No skills published yet</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              List your first skill and start reaching developers.
            </p>
            <Link
              href="/publish"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Publish a Skill
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Skill</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Installs</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] md:table-cell">Rating</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.filter((s) => !skillSearch || s.name.toLowerCase().includes(skillSearch.toLowerCase())).map((skill) => {
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
                      <td className="px-4 py-3">
                        <div className="text-[var(--text)]">{skill.downloads.toLocaleString()}</div>
                        {skill.installs7d > 0 && (
                          <div className="flex items-center gap-1 text-xs text-[var(--green)]">
                            <TrendingUp className="h-3 w-3" />
                            {skill.installs7d} this week
                          </div>
                        )}
                        {Object.keys(skill.installsBySource).length > 0 && (
                          <div className="mt-0.5 flex gap-1">
                            {Object.entries(skill.installsBySource).map(([source, count]) => (
                              <span key={source} className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                                {source} {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[var(--yellow)] text-[var(--yellow)]" />
                          {skill.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={skill.isFree ? "text-[var(--green)]" : "text-[var(--text)]"}>
                          {skill.isFree ? "Free" : `$${skill.price.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {skill.hidden ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--yellow)]/10 px-2 py-0.5 text-xs text-[var(--yellow)]">
                            <EyeOff className="h-3 w-3" /> Hidden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green)]/10 px-2 py-0.5 text-xs text-[var(--green)]">
                            <Eye className="h-3 w-3" /> Visible
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/skills/${skill.slug}/edit`}
                            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => toggleVisibility(skill.id, !skill.hidden)}
                            disabled={actionLoading === skill.id}
                            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
                            title={skill.hidden ? "Make visible" : "Hide"}
                          >
                            {skill.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          {confirmDelete === skill.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteSkill(skill.id)}
                                disabled={actionLoading === skill.id}
                                className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                title="Confirm delete"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(skill.id)}
                              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            No reviews yet. Reviews on your skills will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{review.userName}</span>
                    <span className="mx-2 text-[var(--text-secondary)]">on</span>
                    <span className="text-sm font-medium text-[var(--accent)]">
                      {review.skillName}
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
                {review.comment && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
