"use client";

import { useState, useEffect } from "react";
import { Banknote, Check, Loader2, ExternalLink } from "lucide-react";

export function ConnectBanner() {
  const [status, setStatus] = useState<{
    connected: boolean;
    payoutsEnabled: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/connect/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, payoutsEnabled: false }));
  }, []);

  if (status === null) return null;
  if (status.payoutsEnabled) {
    return (
      <div className="rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/15">
            <Check className="h-4 w-4 text-[var(--green)]" />
          </div>
          <div>
            <p className="text-sm font-medium">Payouts enabled</p>
            <p className="text-xs text-[var(--text-secondary)]">
              You&apos;ll receive 85% of each sale automatically via Stripe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start Connect setup");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
            <Banknote className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {status.connected ? "Complete payout setup" : "Set up payouts"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Connect your Stripe account to receive earnings from paid templates.
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="h-3.5 w-3.5" />
              {status.connected ? "Continue" : "Connect"}
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
