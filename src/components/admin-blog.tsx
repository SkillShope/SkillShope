"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  FileText,
  ImagePlus,
  X,
} from "lucide-react";
import { AdminConfirm } from "./admin-confirm";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

const CATEGORIES = [
  "Career",
  "Business",
  "Estimating",
  "Marketing",
  "Safety",
  "Industry",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  category: "Career",
  author: "RoughInHub Team",
  readTime: "5 min read",
  ctaText: "",
  ctaLink: "",
  published: false,
};

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    setPosts(await res.json());
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageUrl(null);
    setError("");
    setView("form");
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      description: post.description,
      content: post.content,
      category: post.category,
      author: post.author,
      readTime: post.readTime,
      ctaText: post.ctaText || "",
      ctaLink: post.ctaLink || "",
      published: post.published,
    });
    setImageUrl(post.imageUrl);
    setError("");
    setView("form");
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    if (editingId) fd.append("postId", editingId);

    const res = await fetch("/api/admin/blog/image", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Image upload failed");
      setUploading(false);
      return;
    }

    const { url } = await res.json();
    setImageUrl(url);
    setUploading(false);
  };

  const removeImage = async () => {
    if (editingId && imageUrl) {
      await fetch("/api/admin/blog/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: editingId }),
      });
    }
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = "/api/admin/blog";
    const method = editingId ? "PATCH" : "POST";
    const payload = { ...form, imageUrl };
    const body = editingId ? { id: editingId, ...payload } : payload;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
    setView("list");
    loadPosts();
  };

  const togglePublished = async (post: BlogPost) => {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, published: !post.published }),
    });
    loadPosts();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    setDeleteTarget(null);
    loadPosts();
  };

  if (view === "form") {
    return (
      <div>
        <button
          onClick={() => setView("list")}
          className="mb-6 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to posts
        </button>

        <h2 className="mb-6 text-xl font-bold">
          {editingId ? "Edit Post" : "New Post"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              placeholder="How to Start a Plumbing Business"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              placeholder="Meta description for SEO and listing excerpt"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Read Time
              </label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="5 min read"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={16}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 font-mono text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none"
              placeholder="## Introduction&#10;&#10;Your post content here. Use ## for headings, **bold** for emphasis, - for lists."
            />
            <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
              Supports: ## headings, ### subheadings, **bold**, - bullet lists,
              1. numbered lists
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Featured Image <span className="text-[var(--text-secondary)]">(optional)</span>
            </label>
            {imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={imageUrl.includes(".blob.vercel-storage.com/") ? `/api/blog-image?url=${encodeURIComponent(imageUrl)}` : imageUrl}
                  alt="Featured"
                  className="h-40 rounded-lg border border-[var(--border)] object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
                <div className="text-center">
                  {uploading ? (
                    <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
                  ) : (
                    <>
                      <ImagePlus className="mx-auto h-6 w-6 text-[var(--text-secondary)]" />
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Click to upload (JPEG, PNG, WebP, max 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                CTA Text <span className="text-[var(--text-secondary)]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="Download Free Bid Calculator"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                CTA Link <span className="text-[var(--text-secondary)]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.ctaLink}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                placeholder="/blueprints/my-blueprint"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-[var(--border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm">
              {form.published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Post"
                  : "Create Post"}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">Loading posts...</p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {posts.length} post{posts.length !== 1 ? "s" : ""} total,{" "}
          {posts.filter((p) => p.published).length} published
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-[var(--text-secondary)]" />
          <p className="font-medium">No blog posts yet</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create your first post to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.imageUrl ? (
                        <img
                          src={`/api/blog-image?url=${encodeURIComponent(post.imageUrl)}`}
                          alt=""
                          className="h-8 w-12 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-[var(--bg-secondary)]">
                          <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        </div>
                      )}
                      <span className="font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--text-secondary)]/15 px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {new Date(
                      post.publishedAt || post.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => togglePublished(post)}
                        title={post.published ? "Unpublish" : "Publish"}
                        className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {post.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(post)}
                        title="Edit"
                        className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        title="Delete"
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
      )}

      {deleteTarget && (
        <AdminConfirm
          title="Delete this post?"
          description={`"${deleteTarget.title}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete Permanently"
          confirmStyle="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
