import { BlueprintCardSkeleton } from "@/components/skeleton";

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-[var(--bg-secondary)]" />
        <div className="mt-2 h-5 w-32 animate-pulse rounded-lg bg-[var(--bg-secondary)]" />
      </div>
      <div className="mb-6 h-10 w-full animate-pulse rounded-lg bg-[var(--bg-secondary)]" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <BlueprintCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
