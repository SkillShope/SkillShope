import { CopyButton } from "@/components/copy-button";
import { readFileSync } from "fs";
import { join } from "path";

export default function JsonSchemaPage() {
  const schemaContent = readFileSync(
    join(process.cwd(), "public/skill-schema.json"),
    "utf-8"
  );

  const fields = [
    { name: "name", type: "string", required: true, desc: "Display name (2-100 chars)" },
    { name: "slug", type: "string", required: false, desc: "URL identifier. Auto-generated from name if omitted" },
    { name: "description", type: "string", required: true, desc: "Short description (10-300 chars)" },
    { name: "longDescription", type: "string", required: false, desc: "Multi-paragraph description (max 5000 chars)" },
    { name: "type", type: "string", required: false, desc: '"skill" | "mcp-server" | "agent". Default: "skill"' },
    { name: "category", type: "string", required: true, desc: "code-review, testing, deployment, documentation, security, data-pipeline, devops, productivity, database, api, design" },
    { name: "sourceUrl", type: "string", required: false, desc: "Public URL to source (GitHub, npm, etc.)" },
    { name: "sourceType", type: "string", required: false, desc: '"github" | "npm" | "other". Default: "github"' },
    { name: "installCmd", type: "string", required: false, desc: "Command users run to install (max 500 chars)" },
    { name: "compatibility", type: "string", required: false, desc: 'Comma-separated tools. Default: "claude-code"' },
    { name: "tags", type: "string", required: false, desc: "Comma-separated keywords (max 500 chars)" },
    { name: "isFree", type: "boolean", required: false, desc: "Default: true. Community listings are always free" },
    { name: "price", type: "number", required: false, desc: "USD, minimum $0.99 (required if isFree is false)" },
    { name: "listingType", type: "string", required: false, desc: '"original" | "community". Default: "original"' },
    { name: "originalAuthor", type: "string", required: false, desc: "Original author name (for community listings)" },
    { name: "originalUrl", type: "string", required: false, desc: "Original author URL (for community listings)" },
    { name: "skillContent", type: "string", required: false, desc: "SKILL.md content delivered via CLI (max 100KB)" },
    { name: "files", type: "array", required: false, desc: 'Array of {filename, content} for multi-file skills' },
    { name: "dependencies", type: "array", required: false, desc: "Array of slugs this skill depends on" },
  ];

  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">JSON Schema</h1>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
        Field reference for <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-sm">listing.json</code> files.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-2 pr-3 text-left font-medium text-[var(--text-secondary)]">Field</th>
              <th className="py-2 pr-3 text-left font-medium text-[var(--text-secondary)]">Type</th>
              <th className="py-2 pr-3 text-left font-medium text-[var(--text-secondary)]">Req</th>
              <th className="py-2 text-left font-medium text-[var(--text-secondary)]">Description</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.name} className="border-b border-[var(--border)]">
                <td className="py-2 pr-3">
                  <code className="text-xs">{f.name}</code>
                </td>
                <td className="py-2 pr-3 text-xs text-[var(--text-secondary)]">{f.type}</td>
                <td className="py-2 pr-3 text-xs">{f.required ? "Yes" : "—"}</td>
                <td className="py-2 text-xs text-[var(--text-secondary)]">{f.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full schema with copy button */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Full Schema</h2>
          <CopyButton text={schemaContent} />
        </div>
        <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-xs leading-relaxed">
          <code>{schemaContent}</code>
        </pre>
      </div>
    </>
  );
}
