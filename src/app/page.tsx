import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  FileSignature,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Home,
  Building2,
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

  const categories = [
    { name: "Estimating & Bidding", value: "estimating-bidding", icon: Calculator },
    { name: "Service & Repair Checklists", value: "service-repair", icon: ClipboardCheck },
    { name: "Proposals & Contracts", value: "proposals-contracts", icon: FileSignature },
    { name: "Training & Apprentice Materials", value: "training", icon: GraduationCap },
    { name: "Marketing & Client Acquisition", value: "marketing", icon: Megaphone },
    { name: "Safety & Compliance", value: "safety-compliance", icon: ShieldCheck },
    { name: "Residential Plumbing", value: "residential", icon: Home },
    { name: "Commercial Plumbing", value: "commercial", icon: Building2 },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32 text-center">
          <h1 className="font-hero mb-6 text-4xl font-bold tracking-tight sm:text-6xl text-balance">
            RoughInHub —{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[#c97c3a] bg-clip-text text-transparent">
              Real Plumbing Blueprints from Real Plumbers
            </span>
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl max-w-3xl mx-auto">
            You&apos;ve already done the hard work sweating pipes and perfecting your systems.
          </p>
          <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl max-w-3xl mx-auto">
            Now get paid for the smart bid calculators, checklists, proposals, contracts,
            and training materials you&apos;ve built.
          </p>
          <p className="mb-10 text-base font-semibold text-[var(--text)] tracking-wide">
            Buy once → Instant access in your library → Automatic updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors min-w-[200px]"
            >
              Browse Blueprints
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/publish"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-4 text-base font-semibold text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] transition-colors min-w-[200px]"
            >
              Sell Your Blueprints
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blueprints */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Featured Blueprints</h2>
          <Link
            href="/browse"
            className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {featuredBlueprints.length > 0 ? (
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
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
            <p className="text-[var(--text-secondary)]">
              First blueprints coming soon — be the first to sell yours.
            </p>
            <Link
              href="/publish"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
            >
              Start selling <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display mb-8 text-2xl font-bold">Browse by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.value} href={`/browse?category=${cat.value}`}>
                <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] h-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                    <cat.icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display mb-12 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: 1,
                title: "Browse proven blueprints from real plumbers",
                description:
                  "Find templates built by working plumbers — bid sheets, checklists, contracts, and more — sorted by trade and region.",
              },
              {
                step: 2,
                title: "Buy once — instant access in your library",
                description:
                  "Pay once and get immediate access. No subscriptions, no drip-feeding. Download and use today.",
              },
              {
                step: 3,
                title: "Get automatic updates when the creator improves the file",
                description:
                  "When the plumber who built it updates the template, you get the latest version automatically — no rebuying required.",
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
          <h2 className="font-display mb-8 text-3xl font-bold text-balance">
            Stop reinventing the wheel. Buy battle-tested plumbing templates.
          </h2>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-10 py-4 text-base font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Browse Blueprints
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
