# Creating a Great Listing

## The Publish Form

Navigate to skillshope.com/publish (must be signed in) and fill out:

### Required Fields

| Field | Tips |
|-------|------|
| **Type** | Choose Skill, MCP Server, or Agent — pick the one that best matches your tool |
| **Name** | Short, memorable, descriptive. e.g., "Postgres MCP Server" not "My Cool Tool v2" |
| **Short Description** | One sentence, max 200 chars. Lead with what it does, not how it works |
| **Category** | Pick the most relevant. Affects browse filtering |
| **Source URL** | GitHub repo or npm package page — must be a real, accessible URL |
| **Source Type** | GitHub, npm, or Other URL |

### Optional But Recommended

| Field | Tips |
|-------|------|
| **Full Description** | Multi-paragraph overview: what it does, features, requirements, setup |
| **Install Command** | The exact command users run. Be specific: `npx @yourorg/server` not `npm install` |
| **Compatibility** | Comma-separated: `claude-code,codex,cursor` — more compatibility = more users |
| **Tags** | Comma-separated keywords for search: `postgres,database,sql,mcp` |
| **Pricing** | Free or paid ($0.99 minimum). Start free to get reviews, then add a paid tier |

### Slug

Auto-generated from name. This becomes your URL: `skillshope.com/skills/your-slug`. Keep it clean and URL-friendly.

## Common Mistakes

- **Vague descriptions** — "A useful tool" tells buyers nothing. Be specific about what problem you solve
- **Missing install command** — If users can't install it, they can't use it
- **No compatibility info** — Users filter by tool. Missing compatibility means missing from search results
- **Dead source URL** — Linking to a private repo or 404 page kills trust immediately
