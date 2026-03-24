# Configuration

After parsing the API spec, configure the MCP server before generation.

## Auth Configuration

| Option | Flag | Description |
|--------|------|-------------|
| API Key (header) | `--auth api-key-header` | Injects key via `Authorization: Bearer` header |
| API Key (query) | `--auth api-key-query --auth-param key` | Appends key as query parameter |
| OAuth 2.0 | `--auth oauth2` | Generates token refresh flow |
| Basic Auth | `--auth basic` | Base64 encoded `user:pass` header |
| None | `--auth none` | No authentication (default) |

Auth credentials are read from environment variables at runtime, never hardcoded:
- `MCP_API_KEY` — For API key auth
- `MCP_OAUTH_CLIENT_ID` / `MCP_OAUTH_CLIENT_SECRET` — For OAuth
- `MCP_BASIC_USER` / `MCP_BASIC_PASS` — For basic auth

## Tool Selection

By default, all API endpoints become MCP tools. For large APIs, select specific resource groups:

```bash
# Only generate tools for specific resources
mcp-forge generate --spec ./openapi.json --include customers,charges,refunds

# Exclude specific resources
mcp-forge generate --spec ./openapi.json --exclude webhooks,events
```

## Naming

```bash
# Custom server name (defaults to API title from spec)
mcp-forge generate --spec ./openapi.json --name my-api-mcp

# Custom npm scope
mcp-forge generate --spec ./openapi.json --scope @myorg
```

## Output Directory

```bash
# Custom output directory (defaults to ./<server-name>)
mcp-forge generate --spec ./openapi.json --output ./servers/my-api
```

## Rate Limiting

```bash
# Set max requests per second (generates throttling middleware)
mcp-forge generate --spec ./openapi.json --rate-limit 10
```

## Full Example

```bash
mcp-forge generate \
  --spec https://api.stripe.com/openapi.json \
  --name stripe-mcp \
  --scope @myorg \
  --auth api-key-header \
  --include customers,charges,payment_intents \
  --rate-limit 25 \
  --output ./stripe-mcp
```
