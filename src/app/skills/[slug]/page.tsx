import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import {
  Star,
  Download,
  Shield,
  Terminal,
  Server,
  Bot,
  ArrowLeft,
  Clock,
  User,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { ReviewForm } from "@/components/review-form";
import { InstallCard } from "@/components/install-card";

type Props = {
  params: Promise<{ slug: string }>;
};

const typeLabels: Record<string, string> = {
  skill: "AI Skill",
  "mcp-server": "MCP Server",
  agent: "Agent",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = await prisma.skill.findUnique({
    where: { slug },
    select: { name: true, description: true, type: true, rating: true, downloads: true },
  });

  if (!skill) return { title: "Not Found" };

  const title = `${skill.name} — ${typeLabels[skill.type] || "Skill"}`;
  const description = `${skill.description} — ${skill.rating.toFixed(1)} stars, ${skill.downloads.toLocaleString()} installs.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

const typeIcons: Record<string, typeof Terminal> = {
  skill: Terminal,
  "mcp-server": Server,
  agent: Bot,
};

export default async function SkillPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const skill = await prisma.skill.findUnique({
    where: { slug },
    include: {
      author: true,
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!skill) notFound();

  // Server-side ownership check
  let owned = skill.isFree;
  if (!owned && session?.user?.id) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_skillId: { userId: session.user.id, skillId: skill.id },
      },
    });
    owned = !!purchase;
  }

  const TypeIcon = typeIcons[skill.type] || Terminal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <TypeIcon className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{skill.name}</h1>
                {skill.verified && (
                  <Shield className="h-5 w-5 text-[var(--green)]" />
                )}
              </div>
              <p className="mt-1 text-[var(--text-secondary)]">
                {skill.description}
              </p>
              {skill.listingType === "community" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                    Community
                  </span>
                  {skill.originalAuthor && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      Originally by{" "}
                      {skill.originalUrl ? (
                        <a
                          href={skill.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline"
                        >
                          {skill.originalAuthor}
                        </a>
                      ) : (
                        <span className="text-[var(--text)]">{skill.originalAuthor}</span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-[var(--yellow)]" />
              {skill.rating.toFixed(1)} ({skill.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              {skill.downloads.toLocaleString()} installs
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {new Date(skill.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Compatibility */}
          <div className="mt-4 flex flex-wrap gap-2">
            {skill.compatibility.split(",").map((c) => (
              <span
                key={c}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium"
              >
                {c.trim()}
              </span>
            ))}
            {skill.tags?.split(",").map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Source */}
          {skill.sourceUrl && (
            <div className="mt-6">
              <a
                href={skill.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm hover:border-[var(--accent)] transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="capitalize">{skill.sourceType}</span>
                <span className="text-[var(--text-secondary)]">
                  {skill.sourceUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </a>
            </div>
          )}

          {/* Long description */}
          {skill.longDescription && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">About</h2>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--text-secondary)]">
                {skill.longDescription.split("\n").map((p, i) => (
                  <p key={i} className="mb-3">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {skill.securityScore !== null && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Security</h2>
              <div className={`rounded-xl border p-4 ${
                skill.securityScore >= 90
                  ? "border-[var(--green)]/30 bg-[var(--green)]/5"
                  : skill.securityScore >= 70
                    ? "border-[var(--yellow)]/30 bg-[var(--yellow)]/5"
                    : "border-red-500/30 bg-red-500/5"
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {skill.securityScore >= 90 ? (
                    <ShieldCheck className="h-5 w-5 text-[var(--green)]" />
                  ) : skill.securityScore >= 70 ? (
                    <Shield className="h-5 w-5 text-[var(--yellow)]" />
                  ) : (
                    <Shield className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-sm font-semibold">
                    {skill.securityScore >= 90
                      ? "Passed security verification"
                      : skill.securityScore >= 70
                        ? "Passed with minor warnings"
                        : "Security concerns detected"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  {skill.securityScore >= 90
                    ? "This artifact was automatically scanned for malicious patterns, credential access, code execution risks, and source authenticity. All checks passed."
                    : skill.securityScore >= 70
                      ? "This artifact was scanned and passed most checks. Minor warnings were detected (e.g., missing license). Review the source before installing."
                      : "This artifact has security concerns. Review the source code carefully before installing."}
                  {" "}
                  <a href="/docs/verification" className="text-[var(--accent)] hover:underline">
                    Learn about our verification process
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="mb-6 text-lg font-semibold">
              Reviews ({skill.reviewCount})
            </h2>
            {skill.reviews.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {skill.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--text-secondary)]" />
                        <span className="text-sm font-medium">
                          {review.user.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-[var(--yellow)] text-[var(--yellow)]"
                                : "text-[var(--border)]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review form */}
          <div className="mt-8">
            <ReviewForm skillId={skill.id} isSignedIn={!!session?.user} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Install card */}
            <InstallCard
              skillId={skill.id}
              skillName={skill.name}
              skillSlug={skill.slug}
              isFree={skill.isFree}
              price={skill.price}
              installCmd={skill.installCmd}
              sourceUrl={skill.sourceUrl}
              owned={owned}
              isSignedIn={!!session?.user}
            />

            {/* Author card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Publisher
              </h3>
              <div className="flex items-center gap-3">
                {skill.author.image ? (
                  <img
                    src={skill.author.image}
                    alt={skill.author.name || ""}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                    <User className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium">{skill.author.name || "Anonymous"}</p>
                    {skill.author.publisherVerified && (
                      <ShieldCheck className="h-4 w-4 text-[var(--blue)]" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {skill.author.publisherVerified ? "Verified Publisher" : "Publisher"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
