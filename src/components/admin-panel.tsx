"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Trash2,
  StarOff,
  Users,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminConfirm } from "./admin-confirm";

type Blueprint = {
  id: string;
  name: string;
  slug: string;
  type: string;
  featured: boolean;
  downloads: number;
  author: { name: string | null; email: string | null };
};

type User = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  hasStripeAccount: string | null;
  createdAt: string;
  _count: { blueprints: number };
};

type PendingAction = {
  type: "blueprint" | "user";
  id: string;
  action: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmStyle?: "danger" | "default";
};

const ACTION_DETAILS: Record<string, Omit<PendingAction, "type" | "id" | "action">> = {
  feature: {
    title: "Feature this blueprint?",
    description: "This blueprint will appear on the homepage in the Featured section. It signals to visitors that this is a high-quality, recommended resource.",
    confirmLabel: "Feature Blueprint",
  },
  unfeature: {
    title: "Remove from featured?",
    description: "This blueprint will no longer appear in the Featured section on the homepage. It will still be discoverable via browse and search.",
    confirmLabel: "Remove from Featured",
  },
  remove: {
    title: "Delete this blueprint?",
    description: "This will permanently remove the blueprint listing and all associated purchase records. This cannot be undone.",
    confirmLabel: "Delete Permanently",
    confirmStyle: "danger" as const,
  },
  "make-admin-user": {
    title: "Make this user an admin?",
    description: "This user will have full admin access to the platform.",
    confirmLabel: "Make Admin",
  },
  "remove-admin-user": {
    title: "Remove admin access?",
    description: "This user will lose admin access to the platform.",
    confirmLabel: "Remove Admin",
    confirmStyle: "danger" as const,
  },
};

export function AdminPanel() {
  const [tab, setTab] = useState<"blueprints" | "users">("blueprints");
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
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
    setBlueprints(await skillsRes.json());
    setUsers(await usersRes.json());
    setLoading(false);
  };

  const requestAction = (type: "blueprint" | "user", id: string, action: string) => {
    const key = type === "user" ? `${action}-user` : action;
    const details = ACTION_DETAILS[key];
    if (!details) return;
    setPending({ type, id, action, ...details });
  };

  const confirmAction = async () => {
    if (!pending) return;
    const url = pending.type === "blueprint" ? "/api/admin/skills" : "/api/admin/users";
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
        Manage blueprints, publishers, and platform content.
      </p>

      {/* Tabs + Actions */}
      <div className="mb-6 flex items-center justify-between">
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 w-fit">
        <button
          onClick={() => setTab("blueprints")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "blueprints"
              ? "bg-[var(--bg-card)] text-[var(--text)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text)]"
          }`}
        >
          <Package className="h-4 w-4" />
          Blueprints ({blueprints.length})
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
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      ) : tab === "blueprints" ? (
        blueprints.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
            <p className="font-medium">No blueprints yet</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Blueprints will appear here once publishers start listing.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Blueprint</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Publisher</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Downloads</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blueprints.map((blueprint) => (
                  <tr
                    key={blueprint.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                  >
                    <td className="px-4 py-3 font-medium">{blueprint.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {blueprint.author.name || blueprint.author.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs">
                        {blueprint.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {blueprint.downloads.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {blueprint.featured && (
                          <span className="rounded-full bg-[var(--yellow)]/15 px-2 py-0.5 text-xs text-[var(--yellow)]">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => requestAction("blueprint", blueprint.id, blueprint.featured ? "unfeature" : "feature")}
                          title={blueprint.featured ? "Unfeature" : "Feature"}
                          className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--yellow)] transition-colors"
                        >
                          {blueprint.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => requestAction("blueprint", blueprint.id, "remove")}
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
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Blueprints</th>
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
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user._count.blueprints}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {user.isAdmin && (
                        <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs text-[var(--accent)]">
                          Admin
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
                        onClick={() => requestAction("user", user.id, user.isAdmin ? "remove-admin" : "make-admin")}
                        title={user.isAdmin ? "Remove admin" : "Make admin"}
                        className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {user.isAdmin ? (
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
