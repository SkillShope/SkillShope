"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, X, Search } from "lucide-react";

const NAV_ITEMS = [
  { title: "Getting Started", href: "/docs" },
  { title: "Installing Skills", href: "/docs/installing" },
  { title: "Publishing", href: "/docs/publishing" },
  { title: "Pricing & Payouts", href: "/docs/pricing" },
  { title: "JSON Schema", href: "/docs/json-schema" },
  { title: "API Reference", href: "/docs/api-reference" },
  { title: "CLI Reference", href: "/docs/cli-reference" },
  { title: "Community Skills", href: "/docs/community-skills" },
  { title: "Versioning", href: "/docs/versioning" },
  { title: "Security", href: "/docs/security" },
  { title: "Verification Process", href: "/docs/verification" },
  { title: "FAQ", href: "/docs/faq" },
];

function NavLinks({ pathname, onNavigate, filter }: { pathname: string; onNavigate?: () => void; filter?: string }) {
  const items = filter
    ? NAV_ITEMS.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()))
    : NAV_ITEMS;

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-[var(--accent-soft)] text-[var(--text)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [docSearch, setDocSearch] = useState("");

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  };

  return (
    <>
      {/* Mobile toggle — bottom-left, same size as Happie */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] shadow-lg active:scale-95 transition-transform md:hidden"
      >
        <BookOpen className="h-6 w-6" />
      </button>

      {/* Mobile overlay + sliding panel */}
      {open && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-250 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleClose}
          />
          <div
            className={`fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--bg)] p-4 md:hidden transition-transform duration-250 ease-out ${
              closing ? "-translate-x-full" : "translate-x-0"
            }`}
            style={{ animation: closing ? undefined : "slideInLeft 250ms ease-out" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Documentation</span>
              <button
                onClick={handleClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={handleClose} />
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              placeholder="Search docs..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] py-1.5 pl-8 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <NavLinks pathname={pathname} filter={docSearch} />
        </div>
      </aside>
    </>
  );
}
