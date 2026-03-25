import Link from "next/link";

export default function DocsPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">Getting Started</h1>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
        Skill Shope is the registry for AI skills, MCP servers, and agent configurations.
        Developers install tools in one command. Publishers share their work with the community.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">What is Skill Shope?</h2>
      <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
        A registry where you discover, install, and publish AI tools for Claude Code, Codex, Cursor,
        and other AI coding assistants. Think npm for AI skills.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">Quick start</h2>
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-1 font-semibold">1. Browse</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Explore the <Link href="/browse" className="text-[var(--accent)] hover:underline">skill registry</Link> by
            category, type, or keyword.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-1 font-semibold">2. Install</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Run a single command to install any skill:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--bg-secondary)] px-4 py-3 text-sm">
            npx skillshope install pdf-processing
          </pre>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-1 font-semibold">3. Publish</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            <Link href="/auth/signin" className="text-[var(--accent)] hover:underline">Sign in</Link> with
            GitHub, then <Link href="/publish" className="text-[var(--accent)] hover:underline">publish your skill</Link> via
            the web form, JSON upload, or API.
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold">Next steps</h2>
      <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
        <li><Link href="/docs/installing" className="text-[var(--accent)] hover:underline">Installing Skills</Link> — CLI usage and download tokens</li>
        <li><Link href="/docs/publishing" className="text-[var(--accent)] hover:underline">Publishing</Link> — how to list your tools</li>
        <li><Link href="/docs/pricing" className="text-[var(--accent)] hover:underline">Pricing & Payouts</Link> — free and paid options</li>
        <li><Link href="/docs/api-reference" className="text-[var(--accent)] hover:underline">API Reference</Link> — programmatic access</li>
      </ul>
    </>
  );
}
