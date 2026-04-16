"use client";

import { useState } from "react";
import { Sparkles, FileText, Zap, Check, Loader2 } from "lucide-react";

export function ProUpgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
          <Sparkles className="h-7 w-7 text-[var(--accent)]" />
        </div>
        <h1 className="text-3xl font-bold">RoughInHub Pro</h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Professional estimates and contracts in seconds, not hours.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
        <div className="mb-6 text-center">
          <span className="text-4xl font-bold">$19</span>
          <span className="text-lg text-[var(--text-secondary)]">/month</span>
        </div>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-medium">30 AI estimates per month</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Describe any job, get itemized materials, labor, and markup in 60 seconds. Edit everything inline.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-medium">One-click contract generation</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Turn any estimate into a professional service agreement with scope, payment terms, warranty, and liability protection.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-medium">Professional PDF downloads</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Clean, branded PDFs with your business name, phone, and license number. Hand them to homeowners with confidence.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-medium">Photo analysis</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Upload job photos and the AI identifies pipe materials, fixtures, and potential complications.
              </p>
            </div>
          </li>
        </ul>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout...</>
          ) : (
            "Start Pro - $19/month"
          )}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
          Cancel anytime. No long-term commitment.
        </p>
      </div>

      {/* Comparison */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]"></th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Free</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--accent)]">Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="px-4 py-3">Estimates per month</td>
              <td className="px-4 py-3 text-center">3</td>
              <td className="px-4 py-3 text-center font-medium">30</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-4 py-3">Edit & customize</td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-4 py-3">PDF download</td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="px-4 py-3">Photo analysis</td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
            </tr>
            <tr>
              <td className="px-4 py-3">Contract generation</td>
              <td className="px-4 py-3 text-center text-[var(--text-secondary)]">--</td>
              <td className="px-4 py-3 text-center"><Check className="mx-auto h-4 w-4 text-green-400" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
