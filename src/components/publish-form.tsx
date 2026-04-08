"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sheet,
  Archive,
  Upload,
  Loader2,
  Plus,
} from "lucide-react";
import { BLUEPRINT_CATEGORIES, BLUEPRINT_TYPES, ALLOWED_EXTENSIONS } from "@/lib/constants";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  excel: Sheet,
  "zip-pack": Archive,
  doc: FileText,
};

type UploadedFile = {
  id: string;
  filename: string;
  size: number;
};

export function PublishForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    category: "estimating-bidding",
    type: "pdf",
    price: 0,
    isFree: true,
    region: "",
    tags: "",
    contentAcknowledged: false,
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

  const handleCreateBlueprint = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.message || data.error || "Failed to create blueprint");
        return null;
      }
      const blueprint = await res.json();
      setBlueprintId(blueprint.id);
      return blueprint;
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !blueprintId) return;

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("blueprintId", blueprintId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || `Failed to upload ${file.name}`);
          continue;
        }

        const uploaded = await res.json();
        setUploadedFiles((prev) => [
          ...prev,
          { id: uploaded.id, filename: uploaded.filename, size: uploaded.size },
        ]);
      } catch {
        setError(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blueprintId) {
      await handleCreateBlueprint();
    } else {
      router.push("/dashboard");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Sell a Blueprint</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Share your proven plumbing documents — bid calculators, checklists, proposals, and more.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {!blueprintId ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">File Type</label>
            <div className="grid grid-cols-5 gap-3">
              {BLUEPRINT_TYPES.map((t) => {
                const Icon = typeIcons[t.value] || FileText;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateForm("type", t.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                      form.type === t.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${form.type === t.value ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Be specific — include the year, region, and what it covers.</p>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="e.g., 2026 Virginia Residential Bid Calculator"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            {form.slug && (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                URL: <code className="rounded bg-[var(--bg-secondary)] px-1">roughinhub.com/blueprints/{form.slug}</code>
              </p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Short Description</label>
            <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Focus on the value — how much time it saves, what problems it prevents.</p>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="e.g., Saves 3+ hours per bid, reduces underbidding mistakes"
              maxLength={500}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Full Description</label>
            <textarea
              rows={5}
              value={form.longDescription}
              onChange={(e) => updateForm("longDescription", e.target.value)}
              placeholder="Explain what's included, how to use it, and why someone should buy it..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Category + Region */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              >
                {BLUEPRINT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Region</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => updateForm("region", e.target.value)}
                placeholder="e.g., Virginia, Nationwide"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="mb-2 block text-sm font-medium">Pricing</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={form.isFree} onChange={() => updateForm("isFree", true)} className="accent-[var(--accent)]" />
                Free
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={!form.isFree} onChange={() => updateForm("isFree", false)} className="accent-[var(--accent)]" />
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
                    className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">You keep 85% of every sale. We handle payments and delivery.</p>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
              placeholder="bid calculator, residential, virginia (comma-separated)"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Content ownership acknowledgement */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.contentAcknowledged as boolean}
                onChange={(e) => updateForm("contentAcknowledged", e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                I confirm this is my original work and I have the legal right to sell it.
                I agree to the{" "}
                <a
                  href="/terms#copyright"
                  target="_blank"
                  className="text-[var(--accent)] hover:underline"
                >
                  Content &amp; Copyright Policy
                </a>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !form.contentAcknowledged}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {loading ? "Creating..." : "Create Blueprint & Add Files"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-4">
            <p className="text-sm font-medium text-[var(--green)]">
              Blueprint created! Now upload your files.
            </p>
          </div>

          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] py-10 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <span className="font-medium">
                {uploading ? "Uploading..." : "Click to upload files"}
              </span>
              <span className="text-xs">
                {ALLOWED_EXTENSIONS.join(", ")} — max 25MB each, up to 10 files
              </span>
              <input
                type="file"
                accept={ALLOWED_EXTENSIONS.join(",")}
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Uploaded Files</h3>
              {uploadedFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                    <span className="text-sm">{f.filename}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{formatFileSize(f.size)}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            disabled={uploadedFiles.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {uploadedFiles.length === 0
              ? "Upload at least one file to continue"
              : `Publish Blueprint (${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""})`}
          </button>
        </div>
      )}
    </div>
  );
}
