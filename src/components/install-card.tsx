"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2, Key, Terminal } from "lucide-react";
import { CopyButton } from "./copy-button";
import { formatTokenCount } from "@/lib/format-tokens";

type InstallCardProps = {
  skillId: string;
  skillName: string;
  skillSlug: string;
  isFree: boolean;
  price: number;
  installCmd: string | null;
  sourceUrl: string;
  owned: boolean;
  isSignedIn: boolean;
  estimatedTokens?: number | null;
};

export function InstallCard({
  skillId,
  skillName,
  skillSlug,
  isFree,
  price,
  installCmd,
  sourceUrl,
  owned,
  isSignedIn,
  estimatedTokens,
}: InstallCardProps) {
  const [loading, setLoading] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  };

  const fetchToken = async () => {
    const res = await fetch(`/api/deliver/token?skillId=${skillId}`);
    if (res.ok) {
      const data = await res.json();
      setDownloadToken(data.token);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="mb-4 text-center">
        {owned ? (
          <span className="text-3xl font-bold text-[var(--green)]">
            {isFree ? "Free" : "Purchased"}
          </span>
        ) : (
          <span className="text-3xl font-bold">
            {isFree ? (
              <span className="text-[var(--green)]">Free</span>
            ) : (
              `$${price.toFixed(2)}`
            )}
          </span>
        )}
      </div>

      {estimatedTokens != null ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm">
          <Terminal className="h-4 w-4 text-[var(--text-secondary)]" />
          <span>
            <span className="font-medium">{formatTokenCount(estimatedTokens)}</span>
            <span className="text-[var(--text-secondary)]"> estimated tokens</span>
          </span>
        </div>
      ) : (
        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          Token estimate unavailable — available for GitHub imports and pasted content.
        </p>
      )}

      {/* Install command */}
      {installCmd && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Install
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-mono text-xs">
            <code className="flex-1 overflow-x-auto text-[var(--green)]">
              {installCmd}
            </code>
            <CopyButton text={installCmd} />
          </div>
        </div>
      )}

      {/* Download token for owned paid skills */}
      {owned && !isFree && (
        <div className="mb-4">
          {downloadToken ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Download Token
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-mono text-xs">
                <code className="flex-1 overflow-x-auto text-[var(--accent)]">
                  {downloadToken.slice(0, 12)}...{downloadToken.slice(-8)}
                </code>
                <CopyButton text={downloadToken} />
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                Use this token to download via CLI or API.
              </p>
            </div>
          ) : (
            <button
              onClick={fetchToken}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
              Get Download Token
            </button>
          )}
        </div>
      )}

      {/* Action button */}
      {owned ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green)]/15 py-3 text-sm font-semibold text-[var(--green)]"
        >
          <Check className="h-4 w-4" />
          {isFree ? "Install Skill" : "Owned"}
        </button>
      ) : !isFree ? (
        isSignedIn ? (
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Purchase & Install"
            )}
          </button>
        ) : (
          <a
            href="/auth/signin"
            className="flex w-full items-center justify-center rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Sign in to Purchase
          </a>
        )
      ) : null}

      {/* Source link — optional, for publishers who want to show code */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Source
        </a>
      )}
    </div>
  );
}
