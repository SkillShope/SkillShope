export function Logo({ className }: { className?: string }) {
  return (
    <span className={`text-xl font-bold ${className || ""}`}>
      <span className="text-[var(--accent)]">Rough</span>
      <span className="text-[var(--text)]">InHub</span>
    </span>
  );
}
