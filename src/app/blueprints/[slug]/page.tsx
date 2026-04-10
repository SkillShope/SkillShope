import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  FileText,
  Sheet,
  Archive,
  Video,
  User,
  Files,
} from "lucide-react";
import { BuyButton } from "@/components/buy-button";

type Props = { params: Promise<{ slug: string }> };

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  excel: Sheet,
  "zip-pack": Archive,
  video: Video,
  doc: FileText,
};

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  excel: "Excel",
  "zip-pack": "ZIP Bundle",
  video: "Video",
  doc: "Word Doc",
};

const categoryLabels: Record<string, string> = {
  "estimating-bidding": "Estimating & Bidding",
  "service-repair": "Service & Repair",
  "proposals-contracts": "Proposals & Contracts",
  training: "Training & Apprentice",
  marketing: "Marketing",
  "safety-compliance": "Safety & Compliance",
  residential: "Residential",
  commercial: "Commercial",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function BlueprintPage({ params }: Props) {
  const { slug } = await params;

  const blueprint = await prisma.blueprint.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true, showAvatar: true } },
      files: { select: { id: true, filename: true, size: true, mimeType: true } },
    },
  });

  if (!blueprint) notFound();

  const session = await auth();
  let owned = blueprint.isFree;
  if (!owned && session?.user?.id) {
    const purchase = await prisma.purchase.findUnique({
      where: { userId_blueprintId: { userId: session.user.id, blueprintId: blueprint.id } },
    });
    owned = !!purchase;
  }

  const TypeIcon = typeIcons[blueprint.type] || FileText;
  const tags = blueprint.tags ? blueprint.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const longDescParagraphs = blueprint.longDescription
    ? blueprint.longDescription.split("\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Left column — main content */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold sm:text-3xl">{blueprint.name}</h1>
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{blueprint.description}</p>

          {/* Badges row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              {categoryLabels[blueprint.category] || blueprint.category}
            </span>
            {blueprint.region && (
              <span className="flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                <MapPin className="h-3 w-3" />
                {blueprint.region}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-md bg-[var(--bg-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
              <TypeIcon className="h-3 w-3" />
              {typeLabels[blueprint.type] || blueprint.type}
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* About */}
          {longDescParagraphs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">About</h2>
              <div className="space-y-3">
                {longDescParagraphs.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Files Included */}
          {blueprint.files.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">Files Included</h2>
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
                {blueprint.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between bg-[var(--bg-card)] px-4 py-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
                      <span className="truncate text-sm">{file.filename}</span>
                    </div>
                    <span className="ml-4 shrink-0 text-xs text-[var(--text-secondary)]">
                      {formatSize(file.size)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column — purchase sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            {/* Price */}
            <div className="mb-4">
              <span
                className={`text-3xl font-bold ${
                  blueprint.isFree ? "text-[var(--green)]" : "text-[var(--accent)]"
                }`}
              >
                {blueprint.isFree ? "Free" : `$${blueprint.price.toFixed(2)}`}
              </span>
            </div>

            {/* Buy button */}
            <BuyButton
              blueprintId={blueprint.id}
              isFree={blueprint.isFree}
              price={blueprint.price}
              owned={owned}
              isSignedIn={!!session?.user}
            />

            <hr className="my-5 border-[var(--border)]" />

            {/* Author card */}
            <div className="flex items-center gap-3">
              {blueprint.author.showAvatar && blueprint.author.image ? (
                <Image
                  src={blueprint.author.image}
                  alt={blueprint.author.name ?? "Author"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                  <User className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              )}
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Published by</p>
                <p className="text-sm font-medium">{blueprint.author.name ?? "Anonymous"}</p>
              </div>
            </div>

            {/* File count */}
            {blueprint.files.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Files className="h-4 w-4" />
                <span>{blueprint.files.length} {blueprint.files.length === 1 ? "file" : "files"} included</span>
              </div>
            )}

            {/* License note */}
            <p className="mt-4 text-xs text-[var(--text-secondary)]">
              Buy once. Access forever. Non-transferable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
