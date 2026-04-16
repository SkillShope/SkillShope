import type { Metadata } from "next";
import { Shield, Lock, FileText, Globe, ArrowRight, Sparkles, BookOpen, Calculator } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About RoughInHub",
  description:
    "RoughInHub helps plumbers bid faster, work smarter, and stay sharp. AI-powered estimates, professional templates, and trade-focused content for small plumbing shops.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          Tools and knowledge for plumbers who run their own business.
        </h1>
        <div className="space-y-4 text-lg leading-relaxed text-[var(--text-secondary)]">
          <p>
            RoughInHub is built for independent plumbers and small shops. The ones
            who do the work, write the bids, handle the customers, and run the books.
            We make the business side faster so you can spend more time on the trade.
          </p>
        </div>
      </div>

      {/* What we offer */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-bold">What we offer</h2>
        <div className="space-y-4">
          {/* Estimate Tool */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <Calculator className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">AI Estimate Tool</h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Describe a job in plain English. Get a professional, itemized estimate in about
              five seconds -- scope of work, materials with quantities and prices, labor,
              markup, tax, and a clean total. Edit anything inline. Download a branded PDF
              you can hand directly to a homeowner.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              Free users get 3 estimates per month with full editing and professional PDFs.
              Pro subscribers ($19/mo) get 30 estimates plus one-click contract generation
              from any estimate.
            </p>
            <Link
              href="/estimate"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Try the Estimate Tool <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Templates */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <FileText className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Plumbing Templates</h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Bid calculators, service checklists, proposal templates, contracts, safety
              documentation, and training materials -- built by experienced plumbers for
              plumbers. Free downloads available. Paid templates come with secure, instant
              delivery.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              If you have templates that other plumbers would find useful, you can sell
              them here. You set the price, keep your IP, and earn 85% of every sale.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Browse Templates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Blog */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <BookOpen className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">The Blog</h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              Career guides, business advice, bidding strategies, safety updates, and
              industry news written for working plumbers. We cover how new technology
              (including AI) is actually affecting the trade, what the labor market
              looks like, and practical tips for running a more profitable shop. No
              fluff, no corporate jargon.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Read the Blog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* For sellers */}
      <div className="mb-12 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-6">
        <h2 className="mb-3 text-xl font-bold">For template creators</h2>
        <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
          If you've built something useful -- a bid calculator, a training checklist,
          a contract template -- other plumbers will pay for it. RoughInHub handles
          checkout, delivery, and download tokens. You keep 85% of every sale.
        </p>
        <div className="space-y-3">
          {[
            { step: "1", title: "Upload your template", desc: "Set your price or keep it free. Add a description and you're live in minutes." },
            { step: "2", title: "Plumbers find and download", desc: "Free templates are instant. Paid templates use secure, time-limited download tokens." },
            { step: "3", title: "You get paid", desc: "85% of every sale goes directly to your Stripe account. We handle everything else." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/15 text-xs font-bold text-[var(--accent)]">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-bold">How we operate</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "Creators earn fairly",
              description: "85% payout on every sale. No approval queue. No gatekeepers.",
            },
            {
              icon: Lock,
              title: "Documents stay protected",
              description: "Paid templates use time-limited download tokens. Nothing is exposed publicly.",
            },
            {
              icon: Sparkles,
              title: "AI that helps, not replaces",
              description: "The estimate tool drafts. You edit, adjust, and own the final output.",
            },
            {
              icon: Globe,
              title: "Built for small shops",
              description: "Residential, commercial, service, remodel. No enterprise pricing. No feature bloat.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
            >
              <v.icon className="mb-3 h-5 w-5 text-[var(--accent)]" />
              <h3 className="mb-1 font-semibold">{v.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <h2 className="mb-2 text-xl font-bold">Get started</h2>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          Try the estimate tool, browse the templates, or start selling your own.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/estimate"
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try the Estimate Tool
          </Link>
          <Link
            href="/browse"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-semibold hover:border-[var(--accent)]/40 transition-colors"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
