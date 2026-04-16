import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileSignature,
  Zap,
  Camera,
  FileText,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BlueprintCard } from "@/components/blueprint-card";

export default async function HomePage() {
  const featuredBlueprints = await prisma.blueprint.findMany({
    where: { featured: true, hidden: false },
    include: { author: { select: { id: true, name: true, image: true, showAvatar: true } } },
    orderBy: { downloads: "desc" },
    take: 6,
  });

  return (
    <div>
      {/* Hero - AI Estimates */}
      <section className="relative border-b border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 min-h-[calc(100dvh-4rem)] flex items-center sm:min-h-0 sm:py-28">
          <div className="grid gap-12 items-center lg:grid-cols-2 w-full">
            <div>
              <h1 className="font-hero mb-6 text-[3.25rem] leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance sm:px-0">
                Professional Estimates in{" "}
                <span className="bg-gradient-to-r from-[var(--accent)] to-[#c97c3a] bg-clip-text text-transparent">
                  60 Seconds
                </span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-[var(--text-secondary)] max-w-xl">
                Describe the job. Get itemized materials, labor, and markup
                instantly.
              </p>
              <p className="hidden sm:block mb-8 text-base text-[var(--text-secondary)] max-w-xl">
                No more napkin math. No more 3-hour quotes. No more guessing on materials.
              </p>
              <Link
                href="/estimate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors w-full sm:w-auto sm:min-w-[200px]"
              >
                Try the AI Estimator
                <Zap className="h-4 w-4" />
              </Link>
              <div className="hidden sm:flex flex-row gap-4 mt-4">
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-4 text-base font-semibold text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] transition-colors min-w-[200px]"
                >
                  Browse Templates
                </Link>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)] hidden sm:block">
                3 free estimates per month. No credit card required.
              </p>
            </div>
            <div className="hidden lg:flex justify-end">
              <div className="relative w-[320px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)]">
                <Image
                  src="/estimate-tool-screenshot.png"
                  alt="RoughInHub AI Estimate Generator showing job type selection, job description, and photo upload"
                  width={320}
                  height={640}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estimate Features */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display mb-4 text-center text-2xl font-bold">
            Everything You Need to Quote with Confidence
          </h2>
          <p className="mb-12 text-center text-[var(--text-secondary)] max-w-2xl mx-auto">
            Built for plumbers who are tired of losing money on bad estimates
            and losing jobs because quotes take too long.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: "60-Second Estimates",
                description:
                  "Describe any job and get itemized materials, labor, and markup instantly.",
              },
              {
                icon: FileText,
                title: "One-Click Contracts",
                description:
                  "Turn any estimate into a professional service agreement with scope and payment terms.",
              },
              {
                icon: Camera,
                title: "Photo Analysis",
                description:
                  "Upload job photos and the AI identifies pipe materials, fixtures, and potential complications.",
              },
              {
                icon: FileSignature,
                title: "Professional PDFs",
                description:
                  "Clean, branded PDFs with your business name, phone, and license number.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center p-4">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="mb-2 font-semibold text-base">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Plan */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 items-center lg:grid-cols-2">
            <div className="hidden lg:flex justify-start order-2 lg:order-1">
              <div className="relative w-[300px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)]">
                <Image
                  src="/pro-features-screenshot.png"
                  alt="RoughInHub Pro plan features including AI estimates, contract generation, and PDF downloads"
                  width={300}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display mb-4 text-2xl font-bold">
                Go Pro for{" "}
                <span className="text-[var(--accent)]">$19/month</span>
              </h2>
              <p className="mb-6 text-[var(--text-secondary)]">
                The free tier gives you 3 estimates per month. Pro unlocks the full toolkit.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "30 AI estimates per month",
                  "One-click contract generation",
                  "Professional branded PDF downloads",
                  "Photo analysis for job sites",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Start Pro
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Cancel anytime. No long-term commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates - Discovery */}
      {featuredBlueprints.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-2 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)]">
              Also on RoughInHub
            </p>
          </div>
          <h2 className="font-display mb-3 text-center text-2xl font-bold">
            Plumbing Templates from the Field
          </h2>
          <p className="mb-10 text-center text-[var(--text-secondary)] max-w-xl mx-auto">
            Bid calculators, checklists, contracts, and training materials built by working plumbers.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBlueprints.map((blueprint) => (
              <BlueprintCard
                key={blueprint.id}
                slug={blueprint.slug}
                name={blueprint.name}
                description={blueprint.description}
                category={blueprint.category}
                type={blueprint.type}
                price={blueprint.price}
                isFree={blueprint.isFree}
                downloads={blueprint.downloads}
                region={blueprint.region}
                authorName={blueprint.author.name}
                authorImage={blueprint.author.showAvatar ? blueprint.author.image : null}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Browse all templates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display mb-12 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: 1,
                title: "Describe the job",
                description:
                  "Pick a job type, describe the scope, and optionally upload photos. The AI handles the rest.",
              },
              {
                step: 2,
                title: "Get an itemized estimate in seconds",
                description:
                  "Materials, labor, markup -- all broken down and editable. Adjust anything before sending.",
              },
              {
                step: 3,
                title: "Send a professional PDF to the homeowner",
                description:
                  "Generate a clean, branded estimate or contract. No more handwritten quotes on the tailgate.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold text-base">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 text-center">
          <h2 className="font-display mb-4 text-3xl font-bold text-balance">
            Stop guessing. Start estimating.
          </h2>
          <p className="mb-8 text-[var(--text-secondary)]">
            3 free estimates per month. No credit card. No commitment.
          </p>
          <Link
            href="/estimate"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-10 py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Try the AI Estimator
            <Zap className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
