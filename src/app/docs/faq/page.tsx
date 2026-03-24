import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Skill Shope.",
};

const faqs = [
  {
    q: "What is Skill Shope?",
    a: "A marketplace where developers discover and install AI skills, MCP servers, and agent configs — and publishers earn money from their tools. Think npm for the AI coding era.",
  },
  {
    q: "Is it free to use?",
    a: "Browsing and installing free skills costs nothing. Paid skills are priced by the publisher (starting at $0.99). Publishing is free — we only take a 15% fee on paid sales.",
  },
  {
    q: "How do I install a skill?",
    a: "Run npx skillshope install <slug> from your terminal. Free skills install instantly. Paid skills require a purchase and a download token.",
  },
  {
    q: "How do I publish a skill?",
    a: "Sign in with GitHub, then use the web form, upload a listing.json, or publish via the API with an API key. Your skill is listed immediately after submission.",
  },
  {
    q: "How much do publishers earn?",
    a: "85% of every sale. Stripe processing fees are absorbed by the platform. Payouts are automatic via Stripe Connect.",
  },
  {
    q: "What tools are supported?",
    a: "Claude Code, Codex, Cursor, Windsurf, and any MCP-compatible AI coding assistant. Skills are cross-platform by design.",
  },
  {
    q: "What's a community listing?",
    a: "A curated entry for an existing open-source skill. You link to the original source and credit the author. Community listings are always free.",
  },
  {
    q: "Can I charge for someone else's open-source skill?",
    a: "No. Community listings are free-only. You can only charge for original skills that you created.",
  },
  {
    q: "Is my paid skill content protected?",
    a: "Yes. Paid content is stored on our infrastructure and delivered only to verified purchasers via download tokens. Your source URL is just a preview page.",
  },
  {
    q: "How do you verify skills?",
    a: "We auto-verify source URLs on publish (GitHub API, npm registry). Admins manually review and badge skills that meet quality standards.",
  },
  {
    q: "What if I find a malicious skill?",
    a: "Report it to ryan@skillshope.com. We take security seriously and will investigate and remove harmful content promptly.",
  },
  {
    q: "Can I publish via CI/CD?",
    a: "Yes. Generate an API key from your dashboard and use POST /api/publish with a Bearer token. Perfect for GitHub Actions workflows.",
  },
];

export default function FaqPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">FAQ</h1>
      <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">
        Quick answers to common questions. Can&apos;t find what you need?{" "}
        <a href="mailto:ryan@skillshope.com" className="text-[var(--accent)] hover:underline">
          Get in touch
        </a>.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-colors open:border-[var(--accent)]/30"
          >
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="ml-4 shrink-0 text-[var(--text-secondary)] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
