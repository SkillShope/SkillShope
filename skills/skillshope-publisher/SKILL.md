---
name: skillshope-publisher
description: >-
  Guides developers through publishing and monetizing AI skills, MCP servers,
  and agent configurations on Skill Shope. Covers listing creation, pricing
  strategy, Stripe Connect setup for payouts, source hosting, and optimization
  for discovery. Use when a developer wants to publish, list, sell, or monetize
  their AI tools on Skill Shope.
---

Skill Shope is the registry for AI skills, MCP servers, and agent configurations. Publishers list their tools, set prices, and earn 85% of each sale. Skill Shope handles discovery, reviews, and payments.

## Quick Start

| Step | What to do | Details |
|------|-----------|---------|
| 1. Sign up | Sign in with GitHub at skillshope.com | Free, takes 30 seconds |
| 2. Set up payouts | Connect Stripe on your dashboard | Required for paid listings, see <references/payouts.md> |
| 3. Host your source | Push your skill to GitHub or npm | See <references/source-hosting.md> |
| 4. Create listing | Fill out the publish form | See <references/listing-guide.md> |
| 5. Optimize | Improve discoverability | See <references/optimization.md> |

## What Can You Publish?

| Type | What it is | Example install command |
|------|-----------|----------------------|
| **Skill** | A SKILL.md config that teaches AI assistants a specific task | `claude skill add your-skill` |
| **MCP Server** | A Model Context Protocol server for external tool access | `npx @yourorg/mcp-server` |
| **Agent** | An autonomous workflow combining skills and tools | `claude agent install your-agent` |

## Pricing

| Model | When to use | Platform fee |
|-------|-----------|-------------|
| **Free** | Open source tools, community building, getting initial reviews | None |
| **Paid ($0.99+)** | Premium tools, commercial use, ongoing maintenance | 15% per sale |

Publishers receive 85% of each sale automatically via Stripe Connect. Stripe processing fees (~2.9% + $0.30) are deducted from the platform's share.

## Key Policies

- You retain full ownership of your code — Skill Shope only displays your listing metadata
- Source must be hosted externally (GitHub, npm, or any URL) — we are a registry, not a host
- No malware, spam, or IP-infringing content (see terms at skillshope.com/terms)
- Reviews must be genuine — you cannot review your own skills
- Publisher verification (blue badge) is available and increases buyer trust
