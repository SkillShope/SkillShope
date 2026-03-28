"use client";

import { useState, useEffect } from "react";
import { User, Mail, FileText, Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from "lucide-react";

type Props = {
  name: string;
  email: string;
  image: string | null;
  bio: string;
  showAvatar: boolean;
  joinedAt: string;
};

export function ProfileForm({ name: initialName, email, image, bio: initialBio, showAvatar: initialShowAvatar, joinedAt }: Props) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [showAvatar, setShowAvatar] = useState(initialShowAvatar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // API Keys
  const [keys, setKeys] = useState<{ id: string; name: string; lastUsed: string | null; createdAt: string }[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);

  useEffect(() => {
    fetch("/api/api-keys").then((r) => r.json()).then(setKeys).catch(() => {});
  }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setNewKeyName("");
        // Refresh key list
        const updated = await fetch("/api/api-keys").then((r) => r.json());
        setKeys(updated);
      }
    } catch {}
    setCreatingKey(false);
  };

  const deleteKey = async (id: string) => {
    await fetch("/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, showAvatar }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const joinDate = new Date(joinedAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Manage your public profile and account settings.
      </p>

      <div className="mt-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {image ? (
              <img src={image} alt={name} className="h-20 w-20 rounded-full" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <User className="h-10 w-10 text-[var(--accent)]" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{name || "User"}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Member since {joinDate}
            </p>
          </div>
        </div>
        <label className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Show profile photo publicly</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {showAvatar ? "Your photo appears on skill cards and your publisher profile" : "A placeholder icon is shown instead of your photo"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAvatar(!showAvatar)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${showAvatar ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${showAvatar ? "translate-x-5" : ""}`} />
          </button>
        </label>

        {/* Form */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <User className="h-4 w-4 text-[var(--text-secondary)]" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-secondary)] cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Managed by your GitHub account.
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell others about yourself..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-[var(--border)] pt-5">
            {saved && (
              <span className="mr-4 text-sm text-[var(--green)]">Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Connected accounts */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="mb-4 text-sm font-semibold">Connected Accounts</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-[var(--text-secondary)]">Connected</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--green)]/15 px-3 py-1 text-xs font-medium text-[var(--green)]">
              Active
            </span>
          </div>
        </div>

        {/* API Keys */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-[var(--text-secondary)]" />
            <h2 className="text-sm font-semibold">API Keys</h2>
          </div>
          <p className="mb-4 text-xs text-[var(--text-secondary)]">
            Use API keys to authenticate the CLI and API. Keys are shown once when created — save them securely.
          </p>

          {/* New key created — show once */}
          {newKey && (
            <div className="mb-4 rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/5 p-3">
              <p className="mb-2 text-xs font-medium text-[var(--green)]">
                Key created — copy it now. You won&apos;t see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--text)] select-all">
                  {showNewKey ? newKey : newKey.slice(0, 7) + "..." + newKey.slice(-4)}
                </code>
                <button
                  onClick={() => setShowNewKey(!showNewKey)}
                  className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  title={showNewKey ? "Hide" : "Show"}
                >
                  {showNewKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={copyKey}
                  className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  title="Copy"
                >
                  {keyCopied ? <Check className="h-3.5 w-3.5 text-[var(--green)]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Create new key */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              placeholder="Key name (e.g., my-laptop)"
              maxLength={100}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              onClick={createKey}
              disabled={creatingKey || !newKeyName.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
          </div>

          {/* Key list */}
          {keys.length > 0 ? (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{k.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Created {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsed && ` · Last used ${new Date(k.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteKey(k.id)}
                    className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Revoke"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              No API keys yet. Create one to use the CLI.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
