"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

type Props = {
  categories: { name: string; count: number }[];
  currentQuery?: string;
  currentCategory?: string;
  currentType?: string;
  currentSort?: string;
  currentListing?: string;
  currentOwned?: string;
  currentView?: string;
  currentPricing?: string;
  isSignedIn?: boolean;
};

export function SearchFilters({
  categories,
  currentQuery,
  currentCategory,
  currentType,
  currentSort,
  currentListing,
  currentOwned,
  currentView,
  currentPricing,
  isSignedIn,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery || "");

  // Clean URL on mount — remove ?q= but keep the search term in state
  useEffect(() => {
    if (currentQuery) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      const clean = params.toString();
      window.history.replaceState({}, "", clean ? `/browse?${clean}` : "/browse");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Keep q out of URL
    params.delete("q");
    router.push(`/browse?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  }

  function clearSearch() {
    setQuery("");
    router.push("/browse");
  }

  return (
    <div className="space-y-3">
      {/* Search input on browse page */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, MCP servers, agents..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-3">
      {/* View toggle: Skills vs Bundles */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {[
          { label: "Single", value: "" },
          { label: "Bundle", value: "bundles" },
        ].map((v) => (
          <button
            key={v.value}
            onClick={() => updateParam("view", v.value || null)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (currentView || "") === v.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Type filter — only for skills view */}
      {currentView !== "bundles" && <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {[
          { label: "All", value: "" },
          { label: "Skills", value: "skill" },
          { label: "MCP Servers", value: "mcp-server" },
          { label: "Agents", value: "agent" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => updateParam("type", t.value || null)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (currentType || "") === t.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>}

      {/* Listing type filter — only for skills view */}
      {currentView !== "bundles" &&
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {[
          { label: "All", value: "" },
          { label: "Original", value: "original" },
          { label: "Community", value: "community" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => updateParam("listing", t.value || null)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (currentListing || "") === t.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>}

      {/* Pricing filter */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
        {[
          { label: "All", value: "" },
          { label: "Free", value: "free" },
          { label: "Premium", value: "premium" },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => updateParam("pricing", p.value || null)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (currentPricing || "") === p.value
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* My Purchases toggle */}
      {isSignedIn && (
        <button
          onClick={() => updateParam("owned", currentOwned === "true" ? null : "true")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            currentOwned === "true"
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
          }`}
        >
          My Purchases
        </button>
      )}

      {/* Category filter */}
      <select
        value={currentCategory || ""}
        onChange={(e) => updateParam("category", e.target.value || null)}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.count})
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort || ""}
        onChange={(e) => updateParam("sort", e.target.value || null)}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
      >
        <option value="">Popular</option>
        <option value="newest">Newest</option>
        <option value="downloads">Most Downloaded</option>
        <option value="rating">Highest Rated</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
    </div>
  );
}
