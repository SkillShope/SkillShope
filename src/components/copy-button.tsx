"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--green)]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
