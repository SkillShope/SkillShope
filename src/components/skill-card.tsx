import Link from "next/link";
import {
  Download,
  Star,
  Shield,
  Terminal,
  Server,
  Bot,
  Github,
  Package,
  Globe,
} from "lucide-react";

type SkillCardProps = {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  price: number;
  isFree: boolean;
  downloads: number;
  rating: number;
  reviewCount: number;
  compatibility: string;
  verified: boolean;
  reviewStatus: string;
  securityScore: number | null;
  sourceType: string;
  listingType: string;
  originalAuthor: string | null;
  authorName: string | null;
  authorImage: string | null;
};

const typeIcons: Record<string, typeof Terminal> = {
  skill: Terminal,
  "mcp-server": Server,
  agent: Bot,
};

const sourceIcons: Record<string, typeof Terminal> = {
  github: Github,
  npm: Package,
  other: Globe,
};

const typeLabels: Record<string, string> = {
  skill: "Skill",
  "mcp-server": "MCP Server",
  agent: "Agent",
};

const categoryColors: Record<string, string> = {
  "code-review": "bg-blue-500/10 text-blue-400",
  testing: "bg-green-500/10 text-green-400",
  deployment: "bg-orange-500/10 text-orange-400",
  documentation: "bg-purple-500/10 text-purple-400",
  security: "bg-red-500/10 text-red-400",
  "data-pipeline": "bg-cyan-500/10 text-cyan-400",
  devops: "bg-yellow-500/10 text-yellow-400",
  productivity: "bg-pink-500/10 text-pink-400",
  database: "bg-emerald-500/10 text-emerald-400",
  api: "bg-indigo-500/10 text-indigo-400",
};

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function SkillCard(props: SkillCardProps) {
  const TypeIcon = typeIcons[props.type] || Terminal;
  const SourceIcon = sourceIcons[props.sourceType] || Globe;
  const colorClass =
    categoryColors[props.category] || "bg-gray-500/10 text-gray-400";

  return (
    <Link href={`/skills/${props.slug}`}>
      <div className="group relative flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)]">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <TypeIcon className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {typeLabels[props.type] || props.type}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {props.securityScore !== null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  props.securityScore >= 90
                    ? "bg-[var(--green)]/15 text-[var(--green)]"
                    : props.securityScore >= 70
                      ? "bg-[var(--yellow)]/15 text-[var(--yellow)]"
                      : "bg-red-500/15 text-red-400"
                }`}
                title={`Security score: ${props.securityScore}/100`}
              >
                {props.securityScore}
              </span>
            )}
            {props.verified && (
              <Shield className="h-4 w-4 text-[var(--green)]" />
            )}
          </div>
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
          {props.name}
        </h3>
        <p className="mb-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {props.description}
        </p>
        {props.listingType === "community" && props.originalAuthor && (
          <p className="mb-3 text-xs text-[var(--text-secondary)]">
            by <span className="text-[var(--text)]">{props.originalAuthor}</span>
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${colorClass}`}>
            {props.category}
          </span>
          {props.compatibility.split(",").map((c) => (
            <span
              key={c}
              className="rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
            >
              {c.trim()}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[var(--yellow)]" />
              {props.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatDownloads(props.downloads)}
            </span>
            <SourceIcon className="h-3.5 w-3.5" />
          </div>
          <span
            className={`text-sm font-semibold ${
              props.isFree ? "text-[var(--green)]" : "text-[var(--text)]"
            }`}
          >
            {props.isFree ? "Free" : `$${props.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
