"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plumbing blueprints, templates, guides..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3.5 pl-12 pr-24 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
