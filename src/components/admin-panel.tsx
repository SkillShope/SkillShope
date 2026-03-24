"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Shield,
  Trash2,
  ShieldOff,
  StarOff,
  Users,
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { AdminConfirm } from "./admin-confirm";

type Skill = {
  id: string;
  name: string;
  slug: string;
  type: string;
  featured: boolean;
  verified: boolean;
  downloads: number;
  sourceStatus: string;
  sourceCheckedAt: string | null;
  listingType: string;
  originalAuthor: string | null;
  author: { name: string | null; email: string | null; publisherVerified: boolean };
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  publisherVerified: boolean;
  isAdmin: boolean;
  hasStripeAccount: string | null;
  createdAt: string;
  _count: { skills: number; reviews: number };
};

type PendingAction = {
  type: "skill" | "user";
  id: string;
  action: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmStyle?: "danger" | "default";
};

const ACTION_DETAILS: Record<string, Omit<PendingAction, "type" | "id" | "action">> = {
  feature: {
    title: "Feature this skill?",
    description: "This skill will appear on the homepage in the Featured Skills section. It signals to visitors that this is a high-quality, recommended tool.",
    confirmLabel: "Feature Skill",
  },
  unfeature: {
    title: "Remove from featured?",
    description: "This skill will no longer appear in the Featured Skills section on the homepage. It will still be discoverable via browse and search.",
    confirmLabel: "Remove from Featured",
  },
  verify: {
    title: "Verify this skill?",
    description: "A verified badge signals that you've reviewed this skill and it meets Skill Shope's quality and security standards. Only verify skills you've actually reviewed.",
    confirmLabel: "Verify Skill",
  },
  unverify: {
    title: "Remove verification?",
    description: "The verified badge will be removed. This may affect buyer trust if the skill has existing purchases.",
    confirmLabel: "Remove Verification",
  },
  remove: {
    title: "Delete this skill?",
    description: "This will permanently remove the skill listing, all associated reviews, and purchase records. This cannot be undone.",
    confirmLabel: "Delete Permanently",
    confirmStyle: "danger" as const,
  },
  "verify-user": {
    title: "Verify this publisher?",
    description: "A verified publisher badge appears next to their name on all skill listings. Only verify publishers whose identity and output you trust.",
    confirmLabel: "Verify Publisher",
  },
  "unverify-user": {
    title: "Remove publisher verification?",
    description: "The verified publisher badge will be removed from all their skill listings. This may affect buyer trust in their existing skills.",
    confirmLabel: "Remove Verification",
  },
};

export function AdminPanel() {
  const [tab, setTab] = useState<"skills" | "users">("skills");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingAction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [skillsRes, usersRes] = await Promise.all([
      fetch("/api/admin/skills"),
      fetch("/api/admin/users"),
    ]);
    setSkills(await skillsRes.json());
    setUsers(await usersRes.json());
    setLoading(false);
  };

  const reverifySource = async (skillId: string) => {
    await fetch("/api/admin/verify-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId }),
    });
    loadData();
  };

  const reverifyAll = async () => {
    await fetch("/api/admin/verify-source?all=true", { method: "POST" });
    loadData();
  };

  const requestAction = (type: "skill" | "user", id: string, action: string) => {
    const key = type === "user" ? `${action}-user` : action;
    const details = ACTION_DETAILS[key];
    if (!details) return;
    setPending({ type, id, action, ...details });
  };

  const confirmAction = async () => {
    if (!pending) return;
    const url = pending.type === "skill" ? "/api/admin/skills" : "/api/admin/users";
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pending.id, action: pending.action }),
    });
    setPending(null);
    loadData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Admin</h1>
      <p className="mb-6 text-sm text-[var(--text-secondary)]">
        Manage skills, publishers, and platform content.
      </p>

      {/* Tabs + Actions */}
      <div className="mb-6 flex items-center justify-between">
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 w-fit">
        <button
          onClick={() => setTab("skills")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "skills"
              ? "bg-[var(--bg-card)] text-[var(--text)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text)]"
          }`}
        >
          <Package className="h-4 w-4" />
          Skills ({skills.length})
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "users"
              ? "bg-[var(--bg-card)] text-[var(--text)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text)]"
          }`}
        >
          <Users className="h-4 w-4" />
          Users ({users.length})
        </button>
      </div>
      {tab === "skills" && skills.length > 0 && (
        <button
          onClick={reverifyAll}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Verify All Sources
        </button>
      )}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      ) : tab === "skills" ? (
        skills.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
            <p className="font-medium">No skills yet</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Skills will appear here once publishers start listing.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Skill</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Publisher</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Downloads</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                  >
                    <td className="px-4 py-3 font-medium">{skill.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {skill.author.name || skill.author.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs">
                        {skill.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {skill.downloads.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            skill.sourceStatus === "valid"
                              ? "bg-[var(--green)]/15 text-[var(--green)]"
                              : skill.sourceStatus === "invalid"
                                ? "bg-red-500/15 text-red-400"
                                : skill.sourceStatus === "error"
                                  ? "bg-[var(--yellow)]/15 text-[var(--yellow)]"
                                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                          }`}
                        >
                          {skill.sourceStatus}
                        </span>
                        <button
                          onClick={() => reverifySource(skill.id)}
                          title="Re-verify source"
                          className="rounded-md p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {skill.featured && (
                          <span className="rounded-full bg-[var(--yellow)]/15 px-2 py-0.5 text-xs text-[var(--yellow)]">
                            Featured
                          </span>
                        )}
                        {skill.verified && (
                          <span className="rounded-full bg-[var(--green)]/15 px-2 py-0.5 text-xs text-[var(--green)]">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => requestAction("skill", skill.id, skill.featured ? "unfeature" : "feature")}
                          title={skill.featured ? "Unfeature" : "Feature"}
                          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--yellow)] transition-colors"
                        >
                          {skill.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => requestAction("skill", skill.id, skill.verified ? "unverify" : "verify")}
                          title={skill.verified ? "Unverify" : "Verify"}
                          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--green)] transition-colors"
                        >
                          {skill.verified ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => requestAction("skill", skill.id, "remove")}
                          title="Remove"
                          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
          <p className="font-medium">No users yet</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Users will appear here once people sign up.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">User</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Skills</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Reviews</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                >
                  <td className="px-4 py-3 font-medium">{user.name || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user._count.skills}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user._count.reviews}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {user.isAdmin && (
                        <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs text-[var(--accent)]">
                          Admin
                        </span>
                      )}
                      {user.publisherVerified && (
                        <span className="rounded-full bg-[var(--green)]/15 px-2 py-0.5 text-xs text-[var(--green)]">
                          Verified
                        </span>
                      )}
                      {user.hasStripeAccount && (
                        <span className="rounded-full bg-[var(--blue)]/15 px-2 py-0.5 text-xs text-[var(--blue)]">
                          Stripe
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => requestAction("user", user.id, user.publisherVerified ? "unverify" : "verify")}
                        title={user.publisherVerified ? "Unverify publisher" : "Verify publisher"}
                        className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--green)] transition-colors"
                      >
                        {user.publisherVerified ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation modal */}
      {pending && (
        <AdminConfirm
          title={pending.title}
          description={pending.description}
          confirmLabel={pending.confirmLabel}
          confirmStyle={pending.confirmStyle}
          onConfirm={confirmAction}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
