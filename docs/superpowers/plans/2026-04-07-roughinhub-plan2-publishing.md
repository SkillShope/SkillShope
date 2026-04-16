# RoughInHub Pivot — Plan 2: Publishing & File Upload

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the creator publishing flow — form with file uploads to Vercel Blob, safety limits, and plumbing-specific fields — so creators can list and sell blueprints.

**Architecture:** Install `@vercel/blob` for file storage. Create a server-side upload API that validates file type, size, and per-creator storage limits before uploading to Vercel Blob. Store file metadata (URL, size, MIME type) in the `BlueprintFile` table. Build a client-side publish form with multi-file upload, plumbing category selector, region input, and pricing controls. The form POSTs blueprint metadata to `/api/blueprints`, then uploads files to `/api/upload` which stores them in Vercel Blob and links them to the blueprint.

**Tech Stack:** `@vercel/blob`, Next.js 16 App Router, Prisma 6, Vitest

**Branch:** `pivot/roughinhub`
**Database:** Dev branch only. NEVER push to prod.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/api/upload/route.ts` | File upload endpoint — validates, stores to Vercel Blob, creates BlueprintFile record |
| Create | `src/lib/upload-validation.ts` | Server-side file validation (type, size, creator storage limit) |
| Create | `tests/lib/upload-validation.test.ts` | Tests for upload validation |
| Create | `src/components/publish-form.tsx` | Client-side publish form with file upload UI |
| Modify | `src/app/publish/page.tsx` | Render the new PublishForm |
| Modify | `src/app/api/blueprints/route.ts` | Minor: accept Stripe check for paid listings |

---

### Task 1: Install @vercel/blob

**Files:** None (dependency only)

- [ ] **Step 1: Install the package**

```bash
npm install @vercel/blob
```

- [ ] **Step 2: Add BLOB_READ_WRITE_TOKEN to environment**

The Vercel Blob SDK reads `BLOB_READ_WRITE_TOKEN` from the environment. For local development, you need a token from Vercel.

Check if the token already exists in `.env.local`:
```bash
grep BLOB_READ_WRITE_TOKEN .env.local || echo "NOT FOUND"
```

If not found, add a placeholder (the user will fill it in):
```bash
echo 'BLOB_READ_WRITE_TOKEN="vercel_blob_rw_PLACEHOLDER"' >> .env.local
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @vercel/blob for file storage"
```

---

### Task 2: Create Upload Validation Utility (TDD)

**Files:**
- Create: `src/lib/upload-validation.ts`
- Create: `tests/lib/upload-validation.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/upload-validation.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  validateFileType,
  validateFileSize,
  validateFileExtension,
  getExtensionFromFilename,
} from "@/lib/upload-validation";

describe("validateFileType", () => {
  it("accepts PDF files", () => {
    expect(validateFileType("application/pdf")).toBe(true);
  });

  it("accepts Excel files", () => {
    expect(validateFileType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe(true);
    expect(validateFileType("application/vnd.ms-excel")).toBe(true);
  });

  it("accepts Word documents", () => {
    expect(validateFileType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(true);
    expect(validateFileType("application/msword")).toBe(true);
  });

  it("accepts ZIP files", () => {
    expect(validateFileType("application/zip")).toBe(true);
    expect(validateFileType("application/x-zip-compressed")).toBe(true);
  });

  it("accepts video files", () => {
    expect(validateFileType("video/mp4")).toBe(true);
    expect(validateFileType("video/quicktime")).toBe(true);
  });

  it("rejects executable files", () => {
    expect(validateFileType("application/x-executable")).toBe(false);
    expect(validateFileType("application/x-msdownload")).toBe(false);
  });

  it("rejects HTML files", () => {
    expect(validateFileType("text/html")).toBe(false);
  });

  it("rejects JavaScript files", () => {
    expect(validateFileType("application/javascript")).toBe(false);
    expect(validateFileType("text/javascript")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateFileType("")).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files under 25MB", () => {
    expect(validateFileSize(1024)).toBe(true); // 1KB
    expect(validateFileSize(10 * 1024 * 1024)).toBe(true); // 10MB
    expect(validateFileSize(25 * 1024 * 1024)).toBe(true); // exactly 25MB
  });

  it("rejects files over 25MB", () => {
    expect(validateFileSize(25 * 1024 * 1024 + 1)).toBe(false);
    expect(validateFileSize(100 * 1024 * 1024)).toBe(false);
  });

  it("rejects zero-byte files", () => {
    expect(validateFileSize(0)).toBe(false);
  });

  it("rejects negative sizes", () => {
    expect(validateFileSize(-1)).toBe(false);
  });
});

describe("validateFileExtension", () => {
  it("accepts allowed extensions", () => {
    expect(validateFileExtension(".pdf")).toBe(true);
    expect(validateFileExtension(".xlsx")).toBe(true);
    expect(validateFileExtension(".docx")).toBe(true);
    expect(validateFileExtension(".zip")).toBe(true);
    expect(validateFileExtension(".mp4")).toBe(true);
  });

  it("rejects dangerous extensions", () => {
    expect(validateFileExtension(".exe")).toBe(false);
    expect(validateFileExtension(".sh")).toBe(false);
    expect(validateFileExtension(".js")).toBe(false);
    expect(validateFileExtension(".html")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(validateFileExtension(".PDF")).toBe(true);
    expect(validateFileExtension(".Xlsx")).toBe(true);
  });
});

describe("getExtensionFromFilename", () => {
  it("extracts extension from filename", () => {
    expect(getExtensionFromFilename("report.pdf")).toBe(".pdf");
    expect(getExtensionFromFilename("bid-calculator.xlsx")).toBe(".xlsx");
  });

  it("handles multiple dots", () => {
    expect(getExtensionFromFilename("my.report.v2.pdf")).toBe(".pdf");
  });

  it("returns empty string for no extension", () => {
    expect(getExtensionFromFilename("README")).toBe("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/upload-validation.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/lib/upload-validation.ts`:

```typescript
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";

export function validateFileType(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(mimeType);
}

export function validateFileSize(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_FILE_SIZE_BYTES;
}

export function validateFileExtension(ext: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function getExtensionFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/lib/upload-validation.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/upload-validation.ts tests/lib/upload-validation.test.ts
git commit -m "feat: file upload validation — type, size, extension checks"
```

---

### Task 3: Create File Upload API Route

**Files:**
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Create the upload endpoint**

Create `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  validateFileType,
  validateFileSize,
  validateFileExtension,
  getExtensionFromFilename,
} from "@/lib/upload-validation";
import {
  MAX_FILES_PER_BLUEPRINT,
  MAX_STORAGE_PER_CREATOR_BYTES,
  UPLOAD_RATE_LIMIT,
  UPLOAD_RATE_WINDOW_MS,
} from "@/lib/constants";

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { allowed } = rateLimit(
    `upload:${session.user.id}`,
    UPLOAD_RATE_LIMIT,
    UPLOAD_RATE_WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again in a minute." }, { status: 429 });
  }

  // Parse form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const blueprintId = formData.get("blueprintId") as string | null;

  if (!file || !blueprintId) {
    return NextResponse.json({ error: "File and blueprintId are required" }, { status: 400 });
  }

  // Verify blueprint exists and user owns it
  const blueprint = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    select: { id: true, authorId: true },
  });
  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }
  if (blueprint.authorId !== session.user.id) {
    return NextResponse.json({ error: "You don't own this blueprint" }, { status: 403 });
  }

  // Validate file extension
  const ext = getExtensionFromFilename(file.name);
  if (!validateFileExtension(ext)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: .pdf, .xlsx, .xls, .docx, .doc, .zip, .mp4, .mov` },
      { status: 400 }
    );
  }

  // Validate MIME type
  if (!validateFileType(file.type)) {
    return NextResponse.json(
      { error: `MIME type "${file.type}" not allowed` },
      { status: 400 }
    );
  }

  // Validate file size
  if (!validateFileSize(file.size)) {
    return NextResponse.json(
      { error: "File must be between 1 byte and 25MB" },
      { status: 400 }
    );
  }

  // Check files-per-blueprint limit
  const existingFiles = await prisma.blueprintFile.count({
    where: { blueprintId },
  });
  if (existingFiles >= MAX_FILES_PER_BLUEPRINT) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES_PER_BLUEPRINT} files per blueprint` },
      { status: 400 }
    );
  }

  // Check creator storage limit
  const storageUsed = await prisma.blueprintFile.aggregate({
    where: { blueprint: { authorId: session.user.id } },
    _sum: { size: true },
  });
  const currentUsage = storageUsed._sum.size || 0;
  if (currentUsage + file.size > MAX_STORAGE_PER_CREATOR_BYTES) {
    return NextResponse.json(
      { error: "Storage limit reached (500MB). Delete some files or contact support." },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob
  const blob = await put(`blueprints/${blueprintId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  // Save metadata to database
  const blueprintFile = await prisma.blueprintFile.create({
    data: {
      blueprintId,
      filename: file.name,
      blobUrl: blob.url,
      size: file.size,
      mimeType: file.type,
    },
  });

  return NextResponse.json(blueprintFile, { status: 201 });
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds (the route may not work without a real BLOB token, but it should compile).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: file upload API — Vercel Blob with safety limits"
```

---

### Task 4: Create the Publish Form Component

**Files:**
- Create: `src/components/publish-form.tsx`
- Modify: `src/app/publish/page.tsx`

- [ ] **Step 1: Create the publish form**

Create `src/components/publish-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sheet,
  Archive,
  Video,
  Upload,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { BLUEPRINT_CATEGORIES, BLUEPRINT_TYPES, ALLOWED_EXTENSIONS } from "@/lib/constants";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  excel: Sheet,
  "zip-pack": Archive,
  video: Video,
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
      // Step 1: Create the blueprint
      const blueprint = await handleCreateBlueprint();
      if (!blueprint) return;
      // Stay on page for file upload step
    } else {
      // Step 2: Done — navigate to the blueprint
      router.push(`/blueprints/${form.slug}`);
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
        /* Step 1: Blueprint details */
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {loading ? "Creating..." : "Create Blueprint & Add Files"}
          </button>
        </form>
      ) : (
        /* Step 2: File upload */
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-4">
            <p className="text-sm font-medium text-[var(--green)]">
              Blueprint created! Now upload your files.
            </p>
          </div>

          {/* Upload area */}
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

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Uploaded Files</h3>
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                    <span className="text-sm">{f.filename}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatFileSize(f.size)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Done button */}
          <button
            onClick={() => router.push(`/blueprints/${form.slug}`)}
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
```

- [ ] **Step 2: Update the publish page to render the form**

Replace `src/app/publish/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PublishForm } from "@/components/publish-form";

export default async function PublishPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return <PublishForm />;
}
```

- [ ] **Step 3: Verify it renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/publish` — should show the two-step form. Creating a blueprint should work. File upload will only work with a real BLOB_READ_WRITE_TOKEN.

- [ ] **Step 4: Commit**

```bash
git add src/components/publish-form.tsx src/app/publish/page.tsx
git commit -m "feat: publish form — two-step flow with file upload UI"
```

---

### Task 5: Build Verification and Test Suite

**Files:** None new — verification only

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run
```

Expected: All tests pass including the new upload-validation tests.

- [ ] **Step 2: Run the build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Clean build.

- [ ] **Step 3: Manual smoke test**

Start the dev server and verify:
1. `/publish` shows the form with file type selector, plumbing categories, region input
2. Creating a blueprint (without files) works — redirects to detail page stub
3. `/browse` shows the new blueprint
4. File upload UI appears after blueprint creation (actual upload needs BLOB token)

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```

---

## Summary

After completing all 5 tasks:
- `@vercel/blob` installed and configured
- Upload validation with full test coverage (type, size, extension, creator limits)
- File upload API with all safety checks (auth, rate limiting, MIME validation, per-blueprint and per-creator limits)
- Two-step publish form: 1) blueprint details → 2) file upload
- Plumbing categories, region input, pricing controls
- Files stored in Vercel Blob with metadata in BlueprintFile table

**What's NOT in this plan (Plan 3):**
- Blueprint detail page (full version with buy button)
- My Library / dashboard for buyers
- Secure file download flow
- Seed 10 starter blueprints
- Stripe checkout updates for blueprints
