import Link from "next/link";
import {
  Download,
  FileText,
  Sheet,
  Archive,
  Video,
  MapPin,
} from "lucide-react";

type BlueprintCardProps = {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  price: number;
  isFree: boolean;
  downloads: number;
  region: string | null;
  authorName: string | null;
  authorImage: string | null;
};

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

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function BlueprintCard(props: BlueprintCardProps) {
  const TypeIcon = typeIcons[props.type] || FileText;

  return (
    <Link href={`/blueprints/${props.slug}`}>
      <div className="card-hover group relative flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <TypeIcon className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {typeLabels[props.type] || props.type}
            </span>
          </div>
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {props.name}
        </h3>
        <p className="mb-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3">
          {props.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
            {categoryLabels[props.category] || props.category}
          </span>
          {props.region && (
            <span className="flex items-center gap-1 rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
              <MapPin className="h-2.5 w-2.5" />
              {props.region}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatDownloads(props.downloads)}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              props.isFree ? "text-[var(--green)]" : "text-[var(--accent)]"
            }`}
          >
            {props.isFree ? "Free" : `$${props.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
