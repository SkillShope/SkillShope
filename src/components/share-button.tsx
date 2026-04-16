"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, X as Twitter, Linkedin, Link2, Check } from "lucide-react";

type ShareButtonProps = {
  slug: string;
  name: string;
  description: string;
};

export function ShareButton({ slug, name, description }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url = `https://roughinhub.com/blueprints/${slug}`;
  const text = `${name} — ${description}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try native share on mobile
    if (navigator.share) {
      navigator.share({ title: name, text: description, url }).catch(() => {});
      return;
    }

    setOpen(!open);
  };

  const shareTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=RoughInHub`,
      "_blank",
      "width=550,height=420"
    );
    setOpen(false);
  };

  const shareLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420"
    );
    setOpen(false);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleShare}
        className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
        title="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={shareTwitter}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
          >
            <Twitter className="h-3.5 w-3.5" /> X / Twitter
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
          >
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </button>
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-[var(--green)]" /> Copied!</>
            ) : (
              <><Link2 className="h-3.5 w-3.5" /> Copy link</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
