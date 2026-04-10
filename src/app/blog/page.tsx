import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Clock } from "lucide-react";
import { BlogShareButton } from "@/components/blog-share-button";

export const metadata: Metadata = {
  title: "Blog - RoughInHub",
  description:
    "Plumbing career guides, business tips, bidding strategies, and industry insights for plumbers and aspiring plumbers.",
};

const categoryColors: Record<string, string> = {
  Career: "bg-blue-500/10 text-blue-400",
  Business: "bg-green-500/10 text-green-400",
  Estimating: "bg-orange-500/10 text-orange-400",
  Marketing: "bg-purple-500/10 text-purple-400",
  Safety: "bg-red-500/10 text-red-400",
  Industry: "bg-cyan-500/10 text-cyan-400",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold sm:text-4xl">The RoughInHub Blog</h1>
        <p className="mt-3 text-lg text-[var(--text-secondary)]">
          Career guides, business tips, and industry insights for plumbers.
        </p>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {posts.map((post) => (
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
                <BlogShareButton title={post.title} slug={post.slug} />
              </div>

              <h2 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {post.title}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                {post.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
