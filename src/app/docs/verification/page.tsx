import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verification Process",
  description: "How Skill Shope verifies every skill, MCP server, and agent for security and authenticity.",
};

export default function VerificationPage() {
  return (
    <>
      <h1 className="font-display mb-4 text-3xl font-bold">Verification Process</h1>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
        Every artifact on Skill Shope goes through automated security verification before
        it becomes visible to the community. No exceptions.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">How it works</h2>
      <ol className="ml-4 list-decimal space-y-3 text-sm text-[var(--text-secondary)]">
        <li>
          <strong className="text-[var(--text)]">Submission</strong> — A publisher submits a skill, MCP server, or agent via the web form, JSON upload, or API.
          The listing enters a <code className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5">pending</code> state.
        </li>
        <li>
          <strong className="text-[var(--text)]">Automated scan</strong> — Our security pipeline runs immediately. No AI tokens, no manual review queue.
          Pure pattern-matching and API verification.
        </li>
        <li>
          <strong className="text-[var(--text)]">Scoring</strong> — Each artifact receives a security score from 0 to 100 based on the checks that pass or fail.
        </li>
        <li>
          <strong className="text-[var(--text)]">Decision</strong> — Based on the results:
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li><strong className="text-[var(--green)]">Approved</strong> — all checks pass, visible to the community</li>
            <li><strong className="text-[var(--yellow)]">Flagged</strong> — some concerns detected, held for admin review</li>
            <li><strong className="text-red-400">Rejected</strong> — critical security issues found, not published</li>
          </ul>
        </li>
      </ol>

      <h2 className="mb-3 mt-8 text-xl font-bold">What we check</h2>

      <h3 className="mb-2 mt-6 font-semibold">Content security</h3>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        We scan all submitted content (SKILL.md files, config files, install commands) for:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-sm text-[var(--text-secondary)]">
        <li>Arbitrary code execution patterns</li>
        <li>Shell command injection</li>
        <li>Data exfiltration attempts (unauthorized network requests)</li>
        <li>Credential harvesting (references to SSH keys, API tokens, cloud credentials)</li>
        <li>Obfuscated or encoded payloads</li>
        <li>Crypto mining code</li>
        <li>File system abuse (writing to system directories)</li>
      </ul>

      <h3 className="mb-2 mt-6 font-semibold">Source verification</h3>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        When a source URL is provided, we verify:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-sm text-[var(--text-secondary)]">
        <li>The repository or package actually exists and is publicly accessible</li>
        <li>The repository has a recognized open-source license</li>
        <li>The owner account is established (not brand new)</li>
        <li>The repository is actively maintained (not archived or abandoned)</li>
      </ul>

      <h3 className="mb-2 mt-6 font-semibold">Package verification (npm)</h3>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        For npm-hosted tools, we confirm the package exists on the public registry
        and check for known vulnerabilities.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">Security scores</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-secondary)]">Score</th>
              <th className="py-2 pr-4 text-left font-medium text-[var(--text-secondary)]">Badge</th>
              <th className="py-2 text-left font-medium text-[var(--text-secondary)]">Meaning</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-4">90–100</td>
              <td className="py-2 pr-4"><span className="rounded-full bg-[var(--green)]/15 px-2 py-0.5 text-xs font-medium text-[var(--green)]">100</span></td>
              <td className="py-2">All checks passed. Safe to install.</td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-2 pr-4">70–89</td>
              <td className="py-2 pr-4"><span className="rounded-full bg-[var(--yellow)]/15 px-2 py-0.5 text-xs font-medium text-[var(--yellow)]">85</span></td>
              <td className="py-2">Minor warnings (e.g., missing license). Generally safe.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">0–69</td>
              <td className="py-2 pr-4"><span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">45</span></td>
              <td className="py-2">Significant concerns detected. Review carefully before installing.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold">For publishers</h2>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        To maximize your security score:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-sm text-[var(--text-secondary)]">
        <li>Include a license file in your repository (MIT, Apache 2.0, etc.)</li>
        <li>Keep your repository public and actively maintained</li>
        <li>Avoid shell execution patterns in skill content</li>
        <li>Don&apos;t reference credential files or environment variables</li>
        <li>Don&apos;t include encoded or obfuscated content</li>
      </ul>

      <h2 className="mb-3 mt-8 text-xl font-bold">Verified publisher badge</h2>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        In addition to automated security checks, publishers can earn a
        <strong className="text-[var(--text)]"> verified publisher badge</strong>.
        This is a manual review by the Skill Shope team confirming the publisher&apos;s
        identity and track record. Contact{" "}
        <a href="mailto:ryan@skillshope.com" className="text-[var(--accent)] hover:underline">
          ryan@skillshope.com
        </a>{" "}to request verification.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold">Your responsibility</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Automated verification catches known patterns, but no system is perfect.
        Always review source code before installing third-party tools. If you
        find a security issue,{" "}
        <a href="mailto:ryan@skillshope.com" className="text-[var(--accent)] hover:underline">
          report it immediately
        </a>. We take every report seriously.
      </p>
    </>
  );
}
