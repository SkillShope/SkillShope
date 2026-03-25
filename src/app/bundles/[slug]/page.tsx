import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Terminal, Server, Bot, ShieldCheck, Shield } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

const typeIcons: Record<string, typeof Terminal> = {
  skill: Terminal,
  "mcp-server": Server,
  agent: Bot,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await prisma.bundle.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!bundle) return { title: "Not Found" };
  return {
    title: bundle.name,
    description: bundle.description,
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;

  const bundle = await prisma.bundle.findUnique({
    where: { slug },
    include: {
      skills: {
        include: {
          skill: {
            select: {
              slug: true, name: true, type: true, description: true,
              isFree: true, price: true, securityScore: true, verified: true,
              installCmd: true, compatibility: true,
            },
          },
        },
      },
      author: { select: { name: true } },
    },
  });

  if (!bundle) notFound();

  const totalValue = bundle.skills.reduce(
    (sum, bs) => sum + (bs.skill.isFree ? 0 : bs.skill.price),
    0
  );

  const installCmds = bundle.skills
    .map((bs) => bs.skill.installCmd || `npx skillshope install ${bs.skill.slug}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/bundles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bundles
      </Link>

      <div className="mt-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
            <Package className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{bundle.name}</h1>
            <p className="mt-1 text-[var(--text-secondary)]">{bundle.description}</p>
            <div className="mt-2 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span>{bundle.skills.length} tools</span>
              <span>by {bundle.author.name}</span>
              {bundle.discount && (
                <span className="rounded-full bg-[var(--green)]/15 px-2 py-0.5 text-xs font-medium text-[var(--green)]">
                  Save {bundle.discount}%
                </span>
              )}
            </div>
          </div>
        </div>

        {bundle.longDescription && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">About this bundle</h2>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {bundle.longDescription.split("\n").map((p, i) => (
                <p key={i} className="mb-3">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* Install all */}
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Install all {bundle.skills.length} tools</h2>
            <span className={`text-lg font-bold ${bundle.isFree ? "text-[var(--green)]" : ""}`}>
              {bundle.isFree ? "Free" : `$${bundle.price.toFixed(2)}`}
              {!bundle.isFree && totalValue > bundle.price && (
                <span className="ml-2 text-sm font-normal text-[var(--text-secondary)] line-through">
                  ${totalValue.toFixed(2)}
                </span>
              )}
            </span>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-[var(--bg-secondary)] px-4 py-3 text-xs text-[var(--green)]">
            {installCmds}
          </pre>
        </div>

        {/* Skills list */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">What&apos;s included</h2>
          <div className="space-y-3">
            {bundle.skills.map((bs) => {
              const Icon = typeIcons[bs.skill.type] || Terminal;
              return (
                <Link key={bs.skill.slug} href={`/skills/${bs.skill.slug}`}>
                  <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                      <Icon className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{bs.skill.name}</h3>
                        {bs.skill.securityScore != null && bs.skill.securityScore >= 90 && (
                          <ShieldCheck className="h-3.5 w-3.5 text-[var(--green)]" />
                        )}
                        {bs.skill.verified && (
                          <Shield className="h-3.5 w-3.5 text-[var(--blue)]" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                        {bs.skill.description}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-medium ${bs.skill.isFree ? "text-[var(--green)]" : ""}`}>
                      {bs.skill.isFree ? "Free" : `$${bs.skill.price.toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
