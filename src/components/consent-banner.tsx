"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("skillshope-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("skillshope-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-xl">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-[var(--text-secondary)]">
          We use cookie-free analytics to improve Skill Shope. By continuing,
          you agree to our{" "}
          <Link href="/privacy" className="text-[var(--accent)] hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-[var(--accent)] hover:underline">
            Terms of Service
          </Link>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
