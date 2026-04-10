"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "Career", label: "Career" },
  { value: "Business", label: "Business" },
  { value: "Estimating", label: "Estimating" },
  { value: "Marketing", label: "Marketing" },
  { value: "Safety", label: "Safety" },
  { value: "Industry", label: "Industry" },
];

const categoryColors: Record<string, string> = {
  Career: "bg-blue-500/10 text-blue-400",
  Business: "bg-green-500/10 text-green-400",
  Estimating: "bg-orange-500/10 text-orange-400",
  Marketing: "bg-purple-500/10 text-purple-400",
  Safety: "bg-red-500/10 text-red-400",
  Industry: "bg-cyan-500/10 text-cyan-400",
};

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? posts
    : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Sticky category filter */}
      <div className="sticky top-16 z-10 -mx-4 mb-6 border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 pb-4 backdrop-blur-lg sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active === cat.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div className="divide-y divide-[var(--border)]">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-[var(--text-secondary)]">
            No posts in this category yet.
          </p>
        ) : (
          filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group py-8 transition-all">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span className={`rounded-md px-2 py-0.5 font-medium ${categoryColors[post.category] || "bg-gray-500/10 text-gray-400"}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                  <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                <h2 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                  {post.description}
                </p>
              </article>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
