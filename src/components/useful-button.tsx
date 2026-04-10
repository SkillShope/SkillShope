"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";

export function UsefulButton({ slug, isSignedIn }: { slug: string; isSignedIn: boolean }) {
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/blog-vote?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count);
        setVoted(data.voted);
      })
      .catch(() => {});
  }, [slug]);

  const handleVote = async () => {
    if (!isSignedIn) {
      window.location.href = "/auth/signin";
      return;
    }
    if (loading) return;

    setLoading(true);
    // Optimistic update
    setVoted(!voted);
    setCount((c) => (voted ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/blog-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setVoted(data.voted);
      } else {
        // Revert optimistic update
        setVoted(voted);
        setCount((c) => (voted ? c + 1 : c - 1));
      }
    } catch {
      setVoted(voted);
      setCount((c) => (voted ? c + 1 : c - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleVote}
        className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
          voted
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
        }`}
      >
        <ThumbsUp className={`h-4 w-4 ${voted ? "fill-current" : ""}`} />
        {voted ? "You found this useful" : "Useful"}
      </button>
      {count > 0 && (
        <span className="text-sm text-[var(--text-secondary)]">
          {count} {count === 1 ? "plumber" : "plumbers"} found this useful
        </span>
      )}
    </div>
  );
}
