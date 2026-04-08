import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              The marketplace for plumbing blueprints, specs, and trade knowledge.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Product</h4>
            <nav className="space-y-2">
              <Link href="/browse" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Browse Blueprints</Link>
              <Link href="/publish" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Sell</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Legal</h4>
            <nav className="space-y-2">
              <Link href="/terms" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Terms</Link>
              <Link href="/privacy" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Privacy</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} RoughInHub. Built by tradespeople, for tradespeople.</p>
          <p className="mt-2">
            RoughInHub is a marketplace — we do not guarantee the accuracy of third-party blueprints.{" "}
            <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link> &middot;{" "}
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
