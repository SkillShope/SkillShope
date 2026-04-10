import { signIn } from "@/lib/auth";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const maintenance = process.env.MAINTENANCE_MODE === "true";

  if (maintenance) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto mb-4 block" />
          <h1 className="text-2xl font-bold">We&apos;ll be right back</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            RoughInHub is undergoing a quick maintenance update.
            Sign-in will be available again shortly.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse Blueprints
          </Link>
        </div>
      </div>
    );
  }

  if (!authEnabled) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Logo className="mx-auto mb-4 block" />
          <h1 className="text-2xl font-bold">Coming Soon</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            RoughInHub is getting ready for launch. Sign-up will be available
            shortly — browse blueprints in the meantime.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse Blueprints
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 block" />
          <h1 className="text-2xl font-bold">Sign in to RoughInHub</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Sign in to access your plumbing blueprints
          </p>
        </div>

        <div className="mb-6 space-y-2 text-xs text-[var(--text-secondary)]">
          {[
            "Access and manage your purchased blueprints",
            "Sell your own blueprints and specs",
            "Leave reviews and help the community",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-[var(--green)]">✓</span>
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3.5 text-sm font-semibold hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-[var(--accent)] hover:underline">terms of service</Link>.
        </p>
      </div>
    </div>
  );
}
