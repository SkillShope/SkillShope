# skillshope

Install AI skills, MCP servers, and agents from [Skill Shope](https://skillshope.com).

## Quick Start

```bash
npx skillshope install <slug>
```

## Commands

| Command | Description |
|---------|-------------|
| `skillshope install <slug>` | Install a skill, MCP server, or agent |
| `skillshope login` | Authenticate with your API key |
| `skillshope whoami` | Show current logged-in user |
| `skillshope list` | List installed skills in this directory |
| `skillshope help` | Show help |

## Install a Skill

```bash
# Free skills — install instantly
npx skillshope install code-reviewer-pro

# Paid skills — requires login + purchase
npx skillshope login
npx skillshope install premium-skill
```

Skills are installed to the appropriate directory based on type:
- **Skills:** `.claude/skills/<slug>/`
- **MCP Servers:** `.claude/mcp-servers/<slug>/`
- **Agents:** `.claude/agents/<slug>/`

## Authentication

Generate an API key from your [profile page](https://skillshope.com/profile), then:

```bash
npx skillshope login
# Paste your API key when prompted
```

## Compatibility

Works with Claude Code, Codex, Cursor, Windsurf, and any MCP-compatible AI assistant.

## Links

- [Browse Skills](https://skillshope.com/browse)
- [Publish a Skill](https://skillshope.com/publish)
- [CLI Reference](https://skillshope.com/docs/cli-reference)
- [API Reference](https://skillshope.com/docs/api-reference)
