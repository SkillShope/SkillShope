export default function ApiReferencePage() {
  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">API Reference</h1>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
        All endpoints use JSON. Auth via session cookie (browser) or API key (CI/CD).
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">Authentication</h2>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        For programmatic access, generate an API key and pass it as a Bearer token:
      </p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">
        Authorization: Bearer sk_...
      </pre>

      <h2 className="mb-3 mt-10 text-xl font-bold">API Keys</h2>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        API keys authenticate CLI commands and programmatic API access without
        requiring a browser session. Each key is a unique <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">sk_</code>-prefixed
        token tied to your account.
      </p>

      <h3 className="mb-2 mt-6 text-base font-semibold">Creating a key</h3>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
        <li>Go to your <a href="/profile" className="text-[var(--accent)] hover:underline">Profile</a> page</li>
        <li>Scroll to the <strong>API Keys</strong> section</li>
        <li>Enter a name (e.g., &quot;my-laptop&quot; or &quot;github-actions&quot;) and click <strong>Create</strong></li>
        <li>Copy the key immediately — it is shown <strong>once</strong> and cannot be retrieved again</li>
      </ol>

      <h3 className="mb-2 mt-6 text-base font-semibold">Using a key</h3>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">
        <strong>CLI:</strong> Run <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">npx skillshope login</code> and
        paste your key when prompted. It&apos;s saved locally at <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">~/.skillshope/config.json</code>.
      </p>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        <strong>API:</strong> Pass it as a Bearer token in the Authorization header:
      </p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl -X POST https://skillshope.com/api/publish \\
  -H "Authorization: Bearer sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d @listing.json`}</pre>

      <h3 className="mb-2 mt-6 text-base font-semibold">What keys can do</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
        <li>Publish new skills via the API</li>
        <li>Publish new versions of your skills</li>
        <li>Install paid skills you&apos;ve purchased via the CLI</li>
        <li>Access your install analytics</li>
      </ul>

      <h3 className="mb-2 mt-6 text-base font-semibold">Security best practices</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
        <li><strong>Never commit keys to git.</strong> Use environment variables or secrets managers.</li>
        <li><strong>Use descriptive names</strong> so you know which key is used where (e.g., &quot;ci-deploy&quot; vs &quot;local-dev&quot;).</li>
        <li><strong>Revoke keys you no longer use.</strong> Old keys are a liability.</li>
        <li><strong>One key per environment.</strong> Don&apos;t reuse the same key across CI, local, and production.</li>
        <li>Keys are hashed before storage — we never store the plaintext.</li>
      </ul>

      <h3 className="mb-2 mt-6 text-base font-semibold">Managing keys</h3>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        View and revoke keys from your <a href="/profile" className="text-[var(--accent)] hover:underline">Profile</a> page.
        Each key shows its name, creation date, and last used date. Click the trash icon to revoke a key permanently.
      </p>

      <h2 className="mb-3 mt-10 text-xl font-bold">POST /api/publish</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Create a new skill listing. Auth: API key.</p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl -X POST https://skillshope.com/api/publish \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Skill","description":"...","category":"productivity"}'`}</pre>
      <p className="text-xs text-[var(--text-secondary)]">Returns: 201 with skill object. Rate limit: 5/min.</p>

      <h2 className="mb-3 mt-10 text-xl font-bold">GET /api/registry/&lt;slug&gt;</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Look up skill metadata. No auth required. Used by the CLI.</p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl https://skillshope.com/api/registry/pdf-processing`}</pre>
      <p className="text-xs text-[var(--text-secondary)]">Returns: skill metadata, files, versions, dependencies, formats.</p>

      <h2 className="mb-3 mt-10 text-xl font-bold">GET /api/deliver/&lt;skillId&gt;</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Download skill content. Free skills: open. Paid skills: token or session required.</p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`# Free skill
curl https://skillshope.com/api/deliver/<id>

# Paid skill with token
curl https://skillshope.com/api/deliver/<id>?token=<download-token>`}</pre>
      <p className="text-xs text-[var(--text-secondary)]">Returns: {"{ files: [{ filename, content }] }"}. Increments download count.</p>

      <h2 className="mb-3 mt-10 text-xl font-bold">POST /api/api-keys</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Create an API key. Auth: session.</p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl -X POST https://skillshope.com/api/api-keys \\
  -H "Content-Type: application/json" \\
  -d '{"name":"github-actions"}'`}</pre>
      <p className="text-xs text-[var(--text-secondary)]">Returns: {"{ key: 'sk_...', name }"}. The key is shown once and cannot be retrieved again.</p>

      <h2 className="mb-3 mt-10 text-xl font-bold">POST /api/skills/&lt;id&gt;/versions</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Publish a new version of an existing skill. Auth: session or API key. Must be the skill author.</p>
      <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-sm">{`curl -X POST https://skillshope.com/api/skills/<id>/versions \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"version":"1.1.0","changelog":"Bug fixes","files":[...]}'`}</pre>

      <h2 className="mb-3 mt-10 text-xl font-bold">GET /api/analytics/&lt;skillId&gt;</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Install analytics for your skill. Auth: session. Must be the skill author.</p>
      <p className="text-xs text-[var(--text-secondary)]">Returns: {"{ total, last7d, last30d, bySource: { cli, web, api } }"}.</p>

      <h2 className="mb-3 mt-10 text-xl font-bold">GET /.well-known/skills.json</h2>
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Full catalog for external CLI discovery. No auth. 5-minute cache.</p>
    </>
  );
}
