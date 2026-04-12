import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center sm:text-left sm:grid sm:grid-cols-3 sm:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              The marketplace for plumbing blueprints, specs, and trade knowledge.
            </p>
            <a
              href="https://x.com/RoughInHub"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @RoughInHub
            </a>
          </div>

          {/* Product + Legal on mobile: side by side */}
          <div className="mt-8 grid grid-cols-2 gap-8 sm:col-span-2 sm:mt-0">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Product</h4>
              <nav className="space-y-2">
                <Link href="/browse" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Browse Blueprints</Link>
                <Link href="/publish" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Sell</Link>
                <Link href="/blog" className="block text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">Blog</Link>
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
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-secondary)]">
          <p className="mx-auto max-w-xl leading-relaxed">
            RoughInHub hosts user-uploaded content only. We do not own or verify it.
            All blueprints are the seller&apos;s responsibility. We comply with DMCA -
            report infringements to{" "}
            <a href="mailto:dmca@roughinhub.com" className="text-[var(--accent)] hover:underline">dmca@roughinhub.com</a>.{" "}
            <Link href="/terms#copyright" className="text-[var(--accent)] hover:underline">Full policy</Link>.
          </p>
          <p className="mt-4">
            &copy; {new Date().getFullYear()} RoughInHub. Built by tradespeople, for tradespeople.{" "}
            <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link> &middot;{" "}
            <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
