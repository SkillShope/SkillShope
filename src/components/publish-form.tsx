"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Server, Bot, Upload, Github, Package, Globe, FileUp, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

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
  const [importing, setImporting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [error, setError] = useState("");
  const [skillContent, setSkillContent] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
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
    listingType: "original",
    originalAuthor: "",
    originalUrl: "",
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

  // Block publish if GitHub source URL and not verified
  const needsVerification = form.sourceUrl.includes("github.com") && verified === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsVerification) {
      setError("Please verify ownership of the GitHub repository before publishing.");
      return;
    }
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

  const handleGitHubImport = async () => {
    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub URL");
      return;
    }
    setImporting(true);
    setError("");
    setVerified(null);
    setVerifyMessage("");
    try {
      const res = await fetch("/api/github-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to import from GitHub");
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        slug: (data.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        description: data.description || prev.description,
        longDescription: data.longDescription || prev.longDescription,
        sourceUrl: data.sourceUrl || prev.sourceUrl,
        sourceType: "github",
        tags: data.tags || prev.tags,
        listingType: "community", // Default to community until verified
        originalAuthor: data.owner || "",
        originalUrl: data.sourceUrl || "",
        ...(data.category ? { category: data.category } : {}),
      }));
      if (data.skillContent) setSkillContent(data.skillContent);
    } catch {
      setError("Failed to import from GitHub");
    } finally {
      setImporting(false);
    }
  };

  const handleVerifyOwnership = async () => {
    const urlToVerify = githubUrl || form.sourceUrl;
    if (!urlToVerify) return;
    setVerifying(true);
    setVerifyMessage("");
    try {
      const res = await fetch("/api/github-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToVerify }),
      });
      const data = await res.json();
      setVerified(data.verified);
      setVerifyMessage(data.message || "");
      if (data.verified) {
        setForm((prev) => ({ ...prev, listingType: "original", originalAuthor: "", originalUrl: "" }));
      } else {
        setForm((prev) => ({ ...prev, listingType: "community" }));
      }
    } catch {
      setVerified(false);
      setVerifyMessage("Verification failed. Try again later.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Publish a Skill</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Share your AI skills, MCP servers, or agent configs with the community.
      </p>

      {/* GitHub Import */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGitHubImport())}
            />
          </div>
          <button
            type="button"
            onClick={handleGitHubImport}
            disabled={importing || !githubUrl}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
            Import
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-[var(--text-secondary)]">
          Paste a GitHub repo URL to auto-fill name, description, tags, and SKILL.md content.
        </p>

        {/* Ownership verification — shown after import or when source URL is a GitHub link */}
        {(form.sourceUrl.includes("github.com") && verified === null) && (
          <button
            type="button"
            onClick={handleVerifyOwnership}
            disabled={verifying}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] py-2.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
          >
            {verifying ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying ownership...</>
            ) : (
              <><ShieldCheck className="h-3.5 w-3.5" /> Is this yours? Please verify</>
            )}
          </button>
        )}
        {verified === true && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--green)]/30 bg-[var(--green)]/5 px-3 py-2 text-xs text-[var(--green)]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            {verifyMessage}
          </div>
        )}
        {verified === false && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--yellow)]/30 bg-[var(--yellow)]/5 px-3 py-2 text-xs text-[var(--yellow)]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            {verifyMessage}
          </div>
        )}
      </div>

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
            href="/docs/json-schema"
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

        {/* Listing Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">Listing Type</label>
          {/* Lock to community if source is GitHub and not verified */}
          {form.sourceUrl.includes("github.com") && verified !== true ? (
            <div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center text-sm">
                <span className="font-medium">Community</span>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Verify ownership above to list as Original
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateForm("listingType", "original")}
                className={`flex-1 rounded-xl border p-3 text-center text-sm transition-all ${
                  form.listingType === "original"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
                }`}
              >
                <span className="font-medium">Original</span>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Your own skill</p>
              </button>
              <button
                type="button"
                onClick={() => updateForm("listingType", "community")}
                className={`flex-1 rounded-xl border p-3 text-center text-sm transition-all ${
                  form.listingType === "community"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
                }`}
              >
                <span className="font-medium">Community</span>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Curate an existing skill</p>
              </button>
            </div>
          )}
        </div>

        {/* Community Attribution */}
        {form.listingType === "community" && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Community listings link to existing open-source skills with proper attribution.
              The original author is credited and the source URL points to their repo.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Original Author</label>
              <input
                type="text"
                value={form.originalAuthor}
                onChange={(e) => updateForm("originalAuthor", e.target.value)}
                placeholder="e.g., Anthropic"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Original Author URL</label>
              <input
                type="url"
                value={form.originalUrl}
                onChange={(e) => updateForm("originalUrl", e.target.value)}
                placeholder="e.g., https://github.com/anthropics"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">The display name users will see. Keep it short and descriptive.</p>
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
              URL slug: <code className="rounded bg-[var(--bg-secondary)] px-1">{form.slug}</code>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Short Description
          </label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">One sentence that explains what your skill does. This appears in search results and cards.</p>
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="e.g., Automated code review with security and performance checks"
            maxLength={200}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Long Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Full Description
          </label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Explain what your skill does, how it works, and why someone should use it. Shown on the detail page.</p>
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
            <label className="mb-1 block text-sm font-medium">Category</label>
            <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Primary category for browsing.</p>
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
            <label className="mb-1 block text-sm font-medium">
              Compatibility
            </label>
            <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Which AI tools work with this?</p>
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
        {form.listingType === "community" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">Pricing</label>
            <p className="text-sm text-[var(--text-secondary)]">
              Community listings are always free.
            </p>
          </div>
        ) : (
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
        )}

        {/* Source */}
        <div>
          <label className="mb-1 block text-sm font-medium">Source</label>
          <p className="mb-2 text-xs text-[var(--text-secondary)]">Where is the source code hosted? This link appears on your skill page so users can review the code.</p>
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
            value={form.sourceUrl}
            onChange={(e) => updateForm("sourceUrl", e.target.value)}
            placeholder={sourceTypes.find((s) => s.value === form.sourceType)?.placeholder}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Install command */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Install Command
          </label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">The command users will run to install your skill. Use <code className="rounded bg-[var(--bg-secondary)] px-1">npx skillshope install {form.slug || "your-slug"}</code> for Skill Shope distribution.</p>
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
        </div>

        {/* Skill Content */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Skill Content
          </label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
            The actual SKILL.md content delivered to users when they install via the CLI.
            This is your skill&apos;s instructions, prompts, or configuration — the thing that makes AI do the work. The source URL above is just a preview page.
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
          <label className="mb-1 block text-sm font-medium">Tags</label>
          <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Comma-separated keywords to help users find your skill in search.</p>
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
          disabled={loading || needsVerification}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {loading ? "Publishing..." : "Publish Skill"}
        </button>
      </form>
    </div>
  );
}
