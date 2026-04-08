import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service and content policy for RoughInHub — the plumbing blueprint marketplace.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-10 text-sm text-[var(--text-secondary)]">
        Last updated: March 23, 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            1. Overview
          </h2>
          <p>
            RoughInHub (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;)
            is a marketplace for plumbing blueprints, digital documents, and
            professional templates. By using RoughInHub, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            2. Accounts
          </h2>
          <p>
            You must sign in via Google to publish blueprints, submit reviews, or
            make purchases. You are responsible for all activity under your
            account. We may suspend or terminate accounts that violate these
            terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            3. Creators
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              You retain ownership of all blueprints, templates, and documents
              you list on RoughInHub.
            </li>
            <li>
              You grant us a non-exclusive license to display your listing
              (name, description, metadata) on the platform.
            </li>
            <li>
              You must have the right to distribute any content you list.
              Do not list content that infringes on others&apos; intellectual
              property.
            </li>
            <li>
              RoughInHub does not host your files — we link to or deliver the
              documents you provide.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            4. Purchases & Payments
          </h2>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              Payments are processed securely via Stripe. We never handle or
              store your card information.
            </li>
            <li>
              RoughInHub charges a 15% platform fee on paid blueprint sales.
              Creators receive 85% of the sale price via Stripe Connect.
            </li>
            <li>
              All sales are final. Refund requests should be directed to the
              creator.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            5. Content Policy
          </h2>
          <p className="mb-3">
            The following content is prohibited on RoughInHub:
          </p>
          <ul className="ml-4 list-disc space-y-2">
            <li>Fraudulent, misleading, or inaccurate technical documentation</li>
            <li>
              Blueprints designed to facilitate illegal activity, harassment, or
              abuse
            </li>
            <li>Spam, duplicate, or misleading listings</li>
            <li>Content that infringes on intellectual property rights</li>
            <li>
              Documents that collect user data without disclosure or consent
            </li>
            <li>Fake reviews or manipulated ratings</li>
          </ul>
          <p className="mt-3">
            We reserve the right to remove any listing that violates this
            policy and suspend the associated account.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            6. Reviews
          </h2>
          <p>
            Reviews must reflect genuine experience with the blueprint. You may
            not review your own listings. We may remove reviews that are abusive,
            spam, or otherwise violate our content policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            7. Disclaimer
          </h2>
          <p>
            RoughInHub is a marketplace — we do not verify the technical accuracy
            of, or guarantee the fitness for purpose of, listed blueprints and
            documents. Review all materials carefully before use. We encourage
            you to consult a licensed professional before applying any blueprint
            to a real project.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
            8. Changes
          </h2>
          <p>
            We may update these terms at any time. Continued use of the
            platform after changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-[var(--border)] pt-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Questions? Reach out at{" "}
          <a
            href="mailto:ryan@roughinhub.com"
            className="text-[var(--accent)] hover:underline"
          >
            ryan@roughinhub.com
          </a>
        </p>
      </div>
    </div>
  );
}
