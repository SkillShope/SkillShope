# roughinhub

Install AI blueprints, MCP servers, and agents from [RoughInHub](https://roughinhub.com).

## Quick Start

```bash
npx roughinhub install <slug>
```

## Commands

| Command | Description |
|---------|-------------|
| `roughinhub install <slug>` | Install a blueprint, MCP server, or agent |
| `roughinhub login` | Authenticate with your API key |
| `roughinhub whoami` | Show current logged-in user |
| `roughinhub list` | List installed blueprints in this directory |
| `roughinhub help` | Show help |

## Install a Blueprint

```bash
# Free blueprints -- install instantly
npx roughinhub install code-reviewer-pro

# Paid blueprints -- requires login + purchase
npx roughinhub login
npx roughinhub install premium-blueprint
```

Blueprints are installed to the appropriate directory based on type:
- **Blueprints:** `.claude/blueprints/<slug>/`
- **MCP Servers:** `.claude/mcp-servers/<slug>/`
- **Agents:** `.claude/agents/<slug>/`

## Authentication

Generate an API key from your [profile page](https://roughinhub.com/profile), then:

```bash
npx roughinhub login
# Paste your API key when prompted
```

## Compatibility

Works with Claude Code, Codex, Cursor, Windsurf, and any MCP-compatible AI assistant.

## Links

- [Browse Blueprints](https://roughinhub.com/browse)
- [Publish a Blueprint](https://roughinhub.com/publish)
- [CLI Reference](https://roughinhub.com/docs/cli-reference)
- [API Reference](https://roughinhub.com/docs/api-reference)
