import Link from "next/link";

export default function PublishingPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">Publishing</h1>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
        Three ways to publish a skill on Skill Shope.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">1. Web form</h2>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        Sign in and go to <Link href="/publish" className="text-[var(--accent)] hover:underline">/publish</Link>.
        Fill in the fields and submit. Best for one-off listings.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">2. JSON upload</h2>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        Prepare a <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5">listing.json</code> file
        and upload it on the publish page. All fields auto-fill. See the{" "}
        <Link href="/docs/json-schema" className="text-[var(--accent)] hover:underline">JSON Schema</Link> for
        the field reference.
      </p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`{
  "name": "My Skill",
  "description": "What it does in one line.",
  "category": "productivity",
  "type": "skill",
  "sourceUrl": "https://github.com/you/your-skill",
  "sourceType": "github",
  "installCmd": "npx skillshope install my-skill",
  "compatibility": "claude-code,codex,cursor",
  "tags": "tag1,tag2",
  "isFree": true,
  "skillContent": "---\\nname: my-skill\\n---\\n\\nYour skill content..."
}`}</pre>

      <h2 className="mb-3 mt-8 text-xl font-bold">3. API (CI/CD)</h2>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        Publish programmatically with an API key. Generate a key from your dashboard, then:
      </p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl -X POST https://skillshope.com/api/publish \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d @listing.json`}</pre>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        See the <Link href="/docs/api-reference" className="text-[var(--accent)] hover:underline">API Reference</Link> for details.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">Listing types</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-secondary)]">Type</th>
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-secondary)]">Description</th>
              <th className="py-2 text-left font-medium text-[var(--text-secondary)]">Pricing</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-4 font-medium text-[var(--text)]">Original</td>
              <td className="py-2 pr-4">Your own skill</td>
              <td className="py-2">Free or paid</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-[var(--text)]">Community</td>
              <td className="py-2 pr-4">Curating a third-party open-source skill with attribution</td>
              <td className="py-2">Free only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold">Paid skills &amp; source visibility</h2>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        If you&apos;re selling a skill, you don&apos;t need to link a public repo.
        The source URL is optional for paid listings. Your skill content is delivered
        securely through Skill Shope using download tokens — buyers never see
        your source unless you choose to share it.
      </p>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        Think of it this way: your repo is the kitchen, Skill Shope is the restaurant.
        You can link a public repo for credibility, point to a private repo, or leave
        the field empty entirely. The value you&apos;re selling is the curated,
        production-ready, one-command-install package — not raw source code.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-secondary)]">Strategy</th>
              <th className="py-2 text-left font-medium text-[var(--text-secondary)]">Best for</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-4 font-medium text-[var(--text)]">No source link</td>
              <td className="py-2">Maximum IP protection — content lives only on Skill Shope</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-4 font-medium text-[var(--text)]">Private repo link</td>
              <td className="py-2">Shows credibility without exposing code</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-[var(--text)]">Public repo link</td>
              <td className="py-2">Open-source with premium support/packaging — the convenience tax</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
