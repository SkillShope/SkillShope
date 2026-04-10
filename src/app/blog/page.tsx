import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export const metadata: Metadata = {
  title: "Blog - RoughInHub",
  description:
    "Plumbing career guides, business tips, bidding strategies, and industry insights for plumbers and aspiring plumbers.",
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

      <BlogList posts={posts} />
    </div>
  );
}
