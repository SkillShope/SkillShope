"use client";

import Link from "next/link";
import { Plus, LayoutDashboard, User, ShieldCheck, Menu, X } from "lucide-react";
import { useState, ReactNode } from "react";
import { Logo } from "@/components/logo";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

type NavbarProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
  signOutButton?: ReactNode;
};

export function Navbar({ user, isAdmin, signOutButton }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const pathname = usePathname();

  const handleMobileClose = () => {
    setMobileClosing(true);
    setTimeout(() => {
      setMobileNav(false);
      setMobileClosing(false);
    }, 250);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)]/50 bg-[var(--bg)]/10 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo width={140} height={40} />
        </Link>


        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/browse" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">Browse</Link>
          <ThemeToggle />

          {user ? (
            <>
              <Link href="/publish" className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors">
                <Plus className="h-4 w-4" />Sell a Blueprint
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] hover:ring-2 hover:ring-[var(--accent)]/40 transition-all overflow-hidden"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name || ""} className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-[var(--accent)]" />
                  )}
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1.5 shadow-xl">
                      <div className="px-3 py-2 text-sm"><p className="font-medium">{user.name || "User"}</p></div>
                      <div className="my-1 border-t border-[var(--border)]" />
                      <Link href="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"><User className="h-4 w-4" />Profile</Link>
                      <Link href="/dashboard" onClick={() => setShowMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"><LayoutDashboard className="h-4 w-4" />My Library</Link>
                      {isAdmin && (<Link href="/admin" onClick={() => setShowMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors"><ShieldCheck className="h-4 w-4" />Admin</Link>)}
                      <div className="my-1 border-t border-[var(--border)]" />
                      {signOutButton}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth/signin" className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors">Sign In</Link>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => mobileNav ? handleMobileClose() : setMobileNav(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            {mobileNav && !mobileClosing ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile nav overlay — portaled to body to escape nav stacking context */}
      {mobileNav && typeof document !== "undefined" && createPortal(
        <>
          <div
            className={`fixed inset-0 top-16 z-[60] bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-250 ${
              mobileClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleMobileClose}
          />
          <div
            className={`fixed right-0 top-16 z-[70] w-64 border-l border-[var(--border)] bg-[var(--bg)] p-4 md:hidden transition-transform duration-250 ease-out ${
              mobileClosing ? "translate-x-full" : "translate-x-0"
            }`}
            style={{
              height: "calc(100dvh - 4rem)",
              animation: mobileClosing ? undefined : "slideInRight 250ms ease-out",
            }}
          >
            <nav className="space-y-1">
              {[
                { href: "/browse", label: "Browse" },
                ...(user ? [
                  { href: "/publish", label: "Sell a Blueprint" },
                  { href: "/dashboard", label: "My Library" },
                  { href: "/profile", label: "Profile" },
                  ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
                ] : []),
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileClose}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-[var(--accent-soft)] text-[var(--text)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth/signin"
                  onClick={handleMobileClose}
                  className="mt-2 block rounded-lg bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Sign In
                </Link>
              )}
              {user && (
                <div className="mt-2 border-t border-[var(--border)] pt-2">
                  {signOutButton}
                </div>
              )}
            </nav>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}
