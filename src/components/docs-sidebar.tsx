"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
  { title: "FAQ", href: "/docs/faq" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
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

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--bg)] p-4 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Documentation</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Documentation
          </span>
          <NavLinks pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
