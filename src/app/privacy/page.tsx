import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Skill Shope — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-10 text-sm text-[var(--text-secondary)]">
        Last updated: March 24, 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            1. Overview
          </h2>
          <p>
            Skill Shope (&quot;we&quot;, &quot;us&quot;) operates skillshope.com.
            This policy explains what data we collect, how we use it, and your
            rights regarding that data.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            2. Data We Collect
          </h2>
          <h3 className="mb-2 text-sm font-medium text-[var(--text)]">
            Account Data
          </h3>
          <p className="mb-3">
            When you sign in via GitHub, we receive your name, email address,
            and profile image from GitHub. We store this to identify your account.
          </p>
          <h3 className="mb-2 text-sm font-medium text-[var(--text)]">
            Purchase Data
          </h3>
          <p className="mb-3">
            When you purchase a skill, we record the transaction (skill ID, amount,
            Stripe session ID). Payment card details are handled entirely by Stripe
            — we never see or store your card information.
          </p>
          <h3 className="mb-2 text-sm font-medium text-[var(--text)]">
            Content You Submit
          </h3>
          <p className="mb-3">
            Skill listings, reviews, and profile information you submit are stored
            in our database and displayed publicly on the platform.
          </p>
          <h3 className="mb-2 text-sm font-medium text-[var(--text)]">
            Analytics Data
          </h3>
          <p>
            We use Vercel Analytics to collect anonymous usage data including page
            views, referrers, browser type, and device information. This data is
            aggregated and cannot be used to identify individual users. No cookies
            are used for analytics — Vercel Analytics is cookie-free and compliant
            with GDPR, CCPA, and PECR.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            3. How We Use Your Data
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>To provide and maintain your account</li>
            <li>To process purchases and deliver skill content</li>
            <li>To display your published skills and reviews</li>
            <li>To send transactional emails (purchase receipts via Stripe)</li>
            <li>To improve the platform based on aggregated usage patterns</li>
            <li>To prevent fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            4. Third-Party Services
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>GitHub</strong> — Authentication provider. Subject to{" "}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                GitHub&apos;s Privacy Statement
              </a>.
            </li>
            <li>
              <strong>Stripe</strong> — Payment processing. Subject to{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                Stripe&apos;s Privacy Policy
              </a>.
              We never handle or store payment card details.
            </li>
            <li>
              <strong>Vercel</strong> — Hosting and analytics. Analytics are
              cookie-free and anonymous. Subject to{" "}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                Vercel&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Neon</strong> — Database hosting. Subject to{" "}
              <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                Neon&apos;s Privacy Policy
              </a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            5. Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active.
            If you delete your account, we will remove your personal data within
            30 days. Purchase records may be retained for legal and financial
            reporting requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            6. Your Rights
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>Access</strong> — You can view your data in your dashboard
              and profile at any time.
            </li>
            <li>
              <strong>Deletion</strong> — Contact us to request account and data
              deletion.
            </li>
            <li>
              <strong>Portability</strong> — Contact us to receive a copy of your
              data.
            </li>
            <li>
              <strong>Correction</strong> — Update your profile information at any
              time through the platform.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            7. Security
          </h2>
          <p>
            We use HTTPS encryption, secure authentication via OAuth, and never
            store payment card data. Our infrastructure is hosted on Vercel and
            Neon with industry-standard security practices. See our{" "}
            <Link href="/terms" className="text-[var(--accent)] hover:underline">
              Terms of Service
            </Link>{" "}
            for more on our security practices.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            8. Changes
          </h2>
          <p>
            We may update this policy at any time. We will notify users of
            significant changes via the platform. Continued use after changes
            constitutes acceptance.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-[var(--border)] pt-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Questions? Contact{" "}
          <a
            href="mailto:ryan@skillshope.com"
            className="text-[var(--accent)] hover:underline"
          >
            ryan@skillshope.com
          </a>
        </p>
      </div>
    </div>
  );
}
