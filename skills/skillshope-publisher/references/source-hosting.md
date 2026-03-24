# Source Hosting

Skill Shope is a registry — your tool's source code must be hosted externally. We link to it; we don't store it.

## Recommended Hosting by Type

| Type | Best host | Why |
|------|----------|-----|
| **Skill** (SKILL.md) | GitHub repo | Users can review the skill file, star it, and fork it |
| **MCP Server** | npm package | Users install via `npx`, versioning handled by npm |
| **Agent** | GitHub repo | Complex configs benefit from repo structure and README |

## GitHub Repository Setup

1. Create a public repo on GitHub
2. Include at minimum:
   - `SKILL.md` (or your config file) at the root
   - `README.md` with installation and usage instructions
   - `LICENSE` file (MIT recommended for maximum adoption)
3. Use the GitHub repo URL as your Source URL on Skill Shope

### Good repo structure for a Skill:
```
your-skill/
├── SKILL.md          # The skill configuration
├── README.md         # Usage docs
├── LICENSE           # MIT or similar
└── references/       # Supporting files (optional)
    └── guide.md
```

## npm Package Setup

1. Publish your package to npm: `npm publish`
2. Use the npm package page as your Source URL
3. Set the install command to `npx @yourorg/package-name`

## Important

- **Public access required** — Private repos and scoped private npm packages won't work for buyers
- **Keep it maintained** — A stale repo with no recent commits signals abandonment
- **Version your releases** — Use GitHub releases or npm semver so users know what's changed
