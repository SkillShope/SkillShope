import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Logo className="mx-auto mb-6 block" />
        <h1 className="text-6xl font-bold text-[var(--accent)]">404</h1>
        <p className="mt-3 text-lg font-medium">Page not found</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/browse"
            className="rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-semibold hover:border-[var(--accent)]/40 transition-colors"
          >
            Browse Blueprints
          </Link>
        </div>
      </div>
    </div>
  );
}
