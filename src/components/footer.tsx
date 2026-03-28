import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <Logo width={28} height={28} />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              You built it. You earned it.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Product</h4>
            <nav className="space-y-2">
              <Link href="/browse" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Browse Skills</Link>
              <Link href="/publish" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Publish</Link>
              <Link href="/browse?view=bundles" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Bundles</Link>
              <Link href="/docs" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Docs</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Developers</h4>
            <nav className="space-y-2">
              <Link href="/docs/cli-reference" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">CLI Reference</Link>
              <Link href="/docs/json-schema" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">JSON Schema</Link>
              <Link href="/docs/api-reference" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">API Reference</Link>
              <Link href="/docs/security" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Security</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Legal</h4>
            <nav className="space-y-2">
              <Link href="/terms" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Terms</Link>
              <Link href="/privacy" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Privacy</Link>
              <Link href="/about" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">About</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} Skill Shope. Built by builders, for builders.</p>
          <p className="mt-2">
            Skill Shope is a registry — we do not host, execute, or guarantee third-party skills.{" "}
            <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link> &middot;{" "}
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
