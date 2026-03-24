"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: { name: string; count: number }[];
  currentCategory?: string;
  currentType?: string;
  currentSort?: string;
};

export function SearchFilters({
  categories,
  currentCategory,
  currentType,
  currentSort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type filter */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
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
      </div>

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
        <option value="">Newest</option>
        <option value="downloads">Most Downloaded</option>
        <option value="rating">Highest Rated</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}
