"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Server, Bot, Save, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

const categories = [
  "code-review", "testing", "deployment", "documentation",
  "security", "data-pipeline", "devops", "productivity", "database", "api",
];

const skillTypes = [
  { value: "skill", label: "Skill", icon: Terminal },
  { value: "mcp-server", label: "MCP Server", icon: Server },
  { value: "agent", label: "Agent", icon: Bot },
];

type Props = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  type: string;
  price: number;
  isFree: boolean;
  installCmd: string;
  sourceUrl: string;
  sourceType: string;
  compatibility: string;
  tags: string;
  hidden: boolean;
  skillContent: string;
};

export function EditSkillForm(initial: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [longDescription, setLongDescription] = useState(initial.longDescription);
  const [category, setCategory] = useState(initial.category);
  const [type, setType] = useState(initial.type);
  const [price, setPrice] = useState(initial.price);
  const [isFree, setIsFree] = useState(initial.isFree);
  const [installCmd, setInstallCmd] = useState(initial.installCmd);
  const [compatibility, setCompatibility] = useState(initial.compatibility);
  const [tags, setTags] = useState(initial.tags);
  const [hidden, setHidden] = useState(initial.hidden);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/skills/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, longDescription, tags,
          installCmd, isFree, price, hidden,
        }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save changes");
      }
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={`/skills/${initial.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to skill
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Edit {initial.name}</h1>
      <p className="mb-8 text-sm text-[var(--text-secondary)]">
        Update your skill details. Changes take effect immediately.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      <div className="space-y-6">
        {/* Visibility toggle */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div>
            <p className="text-sm font-medium">Visibility</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {hidden ? "Hidden from browse — only you can see it" : "Visible to everyone on browse"}
            </p>
          </div>
          <button
            onClick={() => setHidden(!hidden)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              hidden
                ? "bg-[var(--yellow)]/10 text-[var(--yellow)]"
                : "bg-[var(--green)]/10 text-[var(--green)]"
            }`}
          >
            {hidden ? <><EyeOff className="h-3.5 w-3.5" /> Hidden</> : <><Eye className="h-3.5 w-3.5" /> Visible</>}
          </button>
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">Type</label>
          <div className="grid grid-cols-3 gap-3">
            {skillTypes.map((t) => (
              <div
                key={t.value}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${
                  type === t.value
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] opacity-60"
                }`}
              >
                <t.icon className={`h-6 w-6 ${type === t.value ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Type cannot be changed after publishing.</p>
        </div>

        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Slug: <code className="rounded bg-[var(--bg-secondary)] px-1">{initial.slug}</code> (cannot be changed)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Short Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Long Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Full Description</label>
          <textarea
            rows={5}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Category + Compatibility */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              disabled
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm opacity-60"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Cannot be changed after publishing.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Compatibility</label>
            <input
              type="text"
              value={compatibility}
              disabled
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm opacity-60"
            />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="mb-2 block text-sm font-medium">Pricing</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={isFree}
                onChange={() => { setIsFree(true); setPrice(0); }}
                className="accent-[var(--accent)]"
              />
              Free
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!isFree}
                onChange={() => setIsFree(false)}
                className="accent-[var(--accent)]"
              />
              Paid
            </label>
            {!isFree && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-[var(--text-secondary)]">$</span>
                <input
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Source (read-only) */}
        <div>
          <label className="mb-1 block text-sm font-medium">Source</label>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-secondary)]">
            {initial.sourceUrl || "No source URL"}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Source URL cannot be changed after publishing.</p>
        </div>

        {/* Install Command */}
        <div>
          <label className="mb-1 block text-sm font-medium">Install Command</label>
          <input
            type="text"
            value={installCmd}
            onChange={(e) => setInstallCmd(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated keywords"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Skill Content (read-only preview) */}
        {initial.skillContent && (
          <div>
            <label className="mb-1 block text-sm font-medium">Skill Content</label>
            <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
              SKILL.md content is set at publish time. To update it, publish a new version.
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 font-mono text-xs text-[var(--text-secondary)]">
              {initial.skillContent.slice(0, 2000)}
              {initial.skillContent.length > 2000 && "\n..."}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]/40 transition-colors"
          >
            Done Editing
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
