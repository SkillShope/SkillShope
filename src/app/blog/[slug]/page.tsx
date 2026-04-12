import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getPostSlugs } from "@/lib/blog";
import { auth } from "@/lib/auth";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { UsefulButton } from "@/components/useful-button";
import { BlogShareButton } from "@/components/blog-share-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} - RoughInHub`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      siteName: "RoughInHub",
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const session = await auth();

  // Simple markdown-like rendering for content
  const sections = post.content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-4 text-xl font-bold text-[var(--text)]">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-3 text-lg font-semibold text-[var(--text)]">
          {block.replace("### ", "")}
        </h3>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="mb-4 ml-4 list-disc space-y-1.5 text-[var(--text-secondary)]">
          {items.map((item, j) => (
            <li key={j}>
              {item.replace("- ", "").split("**").map((part, k) =>
                k % 2 === 1 ? (
                  <strong key={k} className="text-[var(--text)]">{part}</strong>
                ) : (
                  <span key={k}>{part}</span>
                )
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (block.match(/^\d+\.\s/)) {
      const items = block.split("\n").filter((l) => l.match(/^\d+\.\s/));
      return (
        <ol key={i} className="mb-4 ml-4 list-decimal space-y-1.5 text-[var(--text-secondary)]">
          {items.map((item, j) => (
            <li key={j}>
              {item.replace(/^\d+\.\s/, "").split("**").map((part, k) =>
                k % 2 === 1 ? (
                  <strong key={k} className="text-[var(--text)]">{part}</strong>
                ) : (
                  <span key={k}>{part}</span>
                )
              )}
            </li>
          ))}
        </ol>
      );
    }
    // Regular paragraph with bold support
    return (
      <p key={i} className="mb-4 leading-relaxed text-[var(--text-secondary)]">
        {block.split("**").map((part, k) =>
          k % 2 === 1 ? (
            <strong key={k} className="text-[var(--text)]">{part}</strong>
          ) : (
            <span key={k}>{part}</span>
          )
        )}
      </p>
    );
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <BlogShareButton title={post.title} slug={post.slug} />
          </div>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
            {post.description}
          </p>
        </header>

        {post.imageUrl && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="prose-custom text-base">{sections}</div>

        {/* Useful button */}
        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <UsefulButton slug={post.slug} isSignedIn={!!session?.user} />
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-6 text-center">
          <p className="mb-4 text-lg font-semibold text-[var(--text)]">
            Ready to put this into practice?
          </p>
          <Link
            href={post.ctaLink}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            {post.ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
