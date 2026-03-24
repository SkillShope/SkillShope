# Skill Shope

**The registry for the agentic era.**

Skill Shope is a marketplace where developers discover, review, and install AI skills, MCP servers, and agent configurations for Claude Code, Codex, Cursor, and other AI coding assistants. Publishers list their tools and earn from their work.

[skillshope.com](https://skillshope.com)

---

## Features

- **Browse & Search** — Find AI skills by category, type, compatibility, and rating
- **Verified Publishers** — Trust badges for vetted publishers and reviewed skills
- **One-Command Install** — Every listing includes a copy-paste install command
- **Secure Payments** — Stripe Checkout with no raw card data handling
- **Publisher Payouts** — Automatic 85% revenue share via Stripe Connect
- **Reviews & Ratings** — Community-driven trust through genuine reviews

## For Publishers

List your AI skills, MCP servers, and agent configs on Skill Shope. Set your price (or publish for free), connect your Stripe account, and start earning.

```bash
npx skills add https://skillshope.com
```

See the [Publisher Guide](https://skillshope.com/about) for details.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io/) + PostgreSQL ([Neon](https://neon.tech/))
- [NextAuth](https://authjs.dev/) (GitHub OAuth)
- [Stripe](https://stripe.com/) (Checkout + Connect)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your keys (see .env.example for required vars)

# Push database schema
npm run db:push

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## License

Copyright 2026 Skill Shope. All rights reserved.
