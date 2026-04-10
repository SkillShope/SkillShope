"use client";

import { useState } from "react";
import { Loader2, ShoppingCart, Download, Check } from "lucide-react";

type BuyButtonProps = {
  blueprintId: string;
  isFree: boolean;
  price: number;
  owned: boolean;
  isSignedIn: boolean;
};

export function BuyButton({ blueprintId, isFree, price, owned, isSignedIn }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  if (owned) {
    return (
      <a
        href={`/api/deliver/${blueprintId}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)]/15 py-4 text-base font-semibold text-[var(--green)]"
      >
        <Check className="h-5 w-5" />
        {isFree ? "Download Free Blueprint" : "Download — Purchased"}
      </a>
    );
  }

  if (!isSignedIn) {
    return (
      <a
        href="/auth/signin"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        {isFree ? "Sign in to Download" : "Sign in to Purchase"}
      </a>
    );
  }

  // Free blueprint + signed in = direct download
  if (isFree) {
    return (
      <a
        href={`/api/deliver/${blueprintId}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        <Download className="h-5 w-5" />
        Download Free Blueprint
      </a>
    );
  }

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprintId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Redirecting to checkout...
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Buy for ${price.toFixed(2)} — Instant Access
        </>
      )}
    </button>
  );
}
