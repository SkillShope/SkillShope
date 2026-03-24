"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Server, Bot, Upload, Github, Package, Globe, FileUp } from "lucide-react";

const categories = [
  "code-review",
  "testing",
  "deployment",
  "documentation",
  "security",
  "data-pipeline",
  "devops",
  "productivity",
  "database",
  "api",
];

const skillTypes = [
  { value: "skill", label: "Skill", icon: Terminal },
  { value: "mcp-server", label: "MCP Server", icon: Server },
  { value: "agent", label: "Agent", icon: Bot },
];

const sourceTypes = [
  { value: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/yourname/your-skill" },
  { value: "npm", label: "npm", icon: Package, placeholder: "https://www.npmjs.com/package/@yourname/skill" },
  { value: "other", label: "Other URL", icon: Globe, placeholder: "https://..." },
];

export function PublishForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillContent, setSkillContent] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    category: "productivity",
    type: "skill",
    price: 0,
    isFree: true,
    installCmd: "",
    sourceUrl: "",
    sourceType: "github",
    compatibility: "claude-code",
    tags: "",
  });

  const updateForm = (key: string, value: string | number | boolean) => {
    if (key === "name") {
      const name = value as string;
      setForm((prev) => ({
        ...prev,
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        ...(skillContent ? { skillContent } : {}),
      };
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const skill = await res.json();
        router.push(`/skills/${skill.slug}`);
      } else {
        const data = await res.json();
        setError(data.errors?.[0]?.message || "Failed to publish skill");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setForm((prev) => ({
          ...prev,
          name: data.name ?? prev.name,
          slug: data.slug ?? (data.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ?? prev.slug),
          description: data.description ?? prev.description,
          longDescription: data.longDescription ?? prev.longDescription,
          category: data.category ?? prev.category,
          type: data.type ?? prev.type,
          price: data.price ?? prev.price,
          isFree: data.isFree ?? prev.isFree,
          installCmd: data.installCmd ?? prev.installCmd,
          sourceUrl: data.sourceUrl ?? prev.sourceUrl,
          sourceType: data.sourceType ?? prev.sourceType,
          compatibility: data.compatibility ?? prev.compatibility,
          tags: data.tags ?? prev.tags,
        }));
        if (data.skillContent) setSkillContent(data.skillContent);
        setError("");
      } catch {
        setError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Publish a Skill</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Share your AI skills, MCP servers, or agent configs with the community.
      </p>

      {/* JSON Upload */}
      <div className="mb-6">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] py-4 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors">
          <FileUp className="h-4 w-4" />
          Upload JSON to auto-fill all fields
          <input
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
          See the{" "}
          <a
            href="/skill-schema.json"
            target="_blank"
            className="text-[var(--accent)] hover:underline"
          >
            JSON schema
          </a>
          {" "}for required fields and format.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">Type</label>
          <div className="grid grid-cols-3 gap-3">
            {skillTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => updateForm("type", t.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  form.type === t.value
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
                }`}
              >
                <t.icon className={`h-6 w-6 ${form.type === t.value ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="e.g., Code Reviewer Pro"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
          {form.slug && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Slug: {form.slug}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Short Description
          </label>
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="One-line description of what this skill does"
            maxLength={200}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Long Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full Description
          </label>
          <textarea
            rows={5}
            value={form.longDescription}
            onChange={(e) => updateForm("longDescription", e.target.value)}
            placeholder="Detailed description, features, usage instructions..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Category + Compatibility */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Compatibility
            </label>
            <input
              type="text"
              value={form.compatibility}
              onChange={(e) => updateForm("compatibility", e.target.value)}
              placeholder="claude-code,codex,cursor"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
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
                checked={form.isFree}
                onChange={() => updateForm("isFree", true)}
                className="accent-[var(--accent)]"
              />
              Free
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!form.isFree}
                onChange={() => updateForm("isFree", false)}
                className="accent-[var(--accent)]"
              />
              Paid
            </label>
            {!form.isFree && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-[var(--text-secondary)]">$</span>
                <input
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Source */}
        <div>
          <label className="mb-2 block text-sm font-medium">Source</label>
          <div className="mb-3 grid grid-cols-3 gap-3">
            {sourceTypes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => updateForm("sourceType", s.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  form.sourceType === s.value
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
                }`}
              >
                <s.icon className={`h-5 w-5 ${form.sourceType === s.value ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>
          <input
            type="url"
            required
            value={form.sourceUrl}
            onChange={(e) => updateForm("sourceUrl", e.target.value)}
            placeholder={sourceTypes.find((s) => s.value === form.sourceType)?.placeholder}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Install command */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Install Command
          </label>
          <input
            type="text"
            value={form.installCmd}
            onChange={(e) => updateForm("installCmd", e.target.value)}
            placeholder={
              form.type === "mcp-server"
                ? "npx @yourorg/server-name"
                : form.type === "agent"
                  ? "claude agent install your-agent"
                  : "claude skill add your-skill"
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
          />
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            The command users will run to install from the source.
          </p>
        </div>

        {/* Skill Content */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Skill Content
          </label>
          <p className="mb-2 text-xs text-[var(--text-secondary)]">
            Paste your SKILL.md content here. This is what users receive when they install
            via the CLI. The source URL above serves as a preview page.
          </p>
          <textarea
            rows={12}
            value={skillContent}
            onChange={(e) => setSkillContent(e.target.value)}
            placeholder="---&#10;name: your-skill&#10;description: >-&#10;  Your skill description...&#10;---&#10;&#10;Your skill content here..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateForm("tags", e.target.value)}
            placeholder="typescript, react, testing (comma-separated)"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {loading ? "Publishing..." : "Publish Skill"}
        </button>
      </form>
    </div>
  );
}
