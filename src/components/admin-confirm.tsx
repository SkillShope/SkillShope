"use client";

import { X } from "lucide-react";

type AdminConfirmProps = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmStyle?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirm({
  title,
  description,
  confirmLabel,
  confirmStyle = "default",
  onConfirm,
  onCancel,
}: AdminConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${
              confirmStyle === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
