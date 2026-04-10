"use client";

import { useState } from "react";
import { Share, Check } from "lucide-react";

export function BlogShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `https://roughinhub.com/blog/${slug}`;

    // Use native share if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or not supported - fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share this article"
      className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--green)]" />
      ) : (
        <Share className="h-4 w-4" />
      )}
    </button>
  );
}
