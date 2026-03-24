"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import Link from "next/link";

type ReviewFormProps = {
  skillId: string;
  isSignedIn: boolean;
};

export function ReviewForm({ skillId, isSignedIn }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isSignedIn) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          <Link href="/auth/signin" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, rating, comment }),
    });

    if (res.ok) {
      setRating(0);
      setComment("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.errors?.[0]?.message || "Failed to submit review");
    }

    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <h3 className="mb-4 text-sm font-semibold">Write a Review</h3>

      {error && (
        <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Star rating */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          Rating
        </label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i + 1)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  i < (hovered || rating)
                    ? "fill-[var(--yellow)] text-[var(--yellow)]"
                    : "text-[var(--border)]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience with this skill..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
