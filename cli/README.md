# roughinhub

The CLI for [RoughInHub](https://roughinhub.com) -- install AI blueprints, MCP servers, and agent configs from the terminal.

## Install

```bash
npx roughinhub install <slug>
```

Or install globally:

```bash
npm install -g roughinhub
```

## Commands

```
roughinhub install <slug>   Install a blueprint by name
roughinhub login            Save your download token for paid blueprints
roughinhub whoami           Show auth status
roughinhub list             List installed blueprints in current project
roughinhub help             Show help
```

## Examples

```bash
# Install a free community blueprint
npx roughinhub install pdf-processing

# Install a paid blueprint (requires purchase + login)
npx roughinhub install mcp-forge

# List what's installed
npx roughinhub list
```

## How it works

1. Looks up the blueprint on the [RoughInHub registry](https://roughinhub.com)
2. Free blueprints download immediately
3. Paid blueprints require a purchase at roughinhub.com, then `roughinhub login` with your download token
4. Files are installed to `.agents/blueprints/<name>/` in your project

## For publishers

List your AI blueprints and earn 85% of every sale:

```bash
# Publish via the web
https://roughinhub.com/publish

# Or via API (CI/CD)
curl -X POST https://roughinhub.com/api/publish \
  -H "Authorization: Bearer sk_..." \
  -H "Content-Type: application/json" \
  -d @listing.json
```

See the [Publisher Guide](https://roughinhub.com/about) and [JSON schema](https://roughinhub.com/blueprint-schema.json).

## Links

- [Browse blueprints](https://roughinhub.com/browse)
- [Publish a blueprint](https://roughinhub.com/publish)
- [Terms](https://roughinhub.com/terms) . [Privacy](https://roughinhub.com/privacy)

## License

Copyright 2026 RoughInHub. All rights reserved.
