---
name: mcp-forge
description: >-
  Generates production-ready MCP (Model Context Protocol) servers from API
  specifications. Accepts OpenAPI/Swagger specs, REST API documentation URLs,
  or manual API descriptions and outputs a complete, typed MCP server with
  tools, auth handling, error mapping, and configuration. Use when building
  an MCP server from an existing API, converting an API to MCP, or scaffolding
  a new MCP server project.
---

MCP Forge generates production-ready MCP servers from API specs. It handles the boilerplate so you ship MCP servers in minutes, not hours.

## Workflow

| Step | Input | Output | Reference |
|------|-------|--------|-----------|
| 1. Provide spec | OpenAPI URL, Swagger JSON, or API docs URL | Parsed API schema | <references/input-formats.md> |
| 2. Configure | Auth type, base URL, tool selection | Server config | <references/configuration.md> |
| 3. Generate | Run generation command | Complete MCP server project | <references/output-structure.md> |
| 4. Test & publish | Validate tools, publish to npm or GitHub | Live MCP server | <references/publishing.md> |

## Supported Input Formats

| Format | Example | Auto-detected |
|--------|---------|---------------|
| **OpenAPI 3.x** | `https://api.example.com/openapi.json` | Yes |
| **Swagger 2.0** | `https://api.example.com/swagger.json` | Yes |
| **API docs URL** | `https://docs.example.com/api` | Parsed via AI |
| **Manual description** | "CRUD API for users with JWT auth at api.example.com" | Structured via AI |

## Auth Patterns

| Pattern | When to use | Generated code |
|---------|-----------|----------------|
| **API Key (header)** | Most SaaS APIs | `Authorization: Bearer ${key}` header injection |
| **API Key (query)** | Legacy APIs | Query param injection |
| **OAuth 2.0** | Google, GitHub, etc. | Token refresh flow with credential storage |
| **Basic Auth** | Internal/simple APIs | Base64 encoded header |
| **No Auth** | Public APIs | Direct requests |

## Generated MCP Tools

Each API endpoint becomes an MCP tool with:
- **Typed parameters** derived from the spec (required/optional, types, descriptions)
- **Structured responses** with consistent error handling
- **Input validation** before making the API call
- **Rate limiting awareness** via retry headers

## Output

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server entry point with tool registration |
| `src/tools/*.ts` | One file per API resource group (users, orders, etc.) |
| `src/auth.ts` | Auth provider based on configured pattern |
| `src/types.ts` | TypeScript types generated from API schema |
| `src/config.ts` | Server configuration (base URL, auth, rate limits) |
| `package.json` | Dependencies, scripts, MCP server metadata |
| `README.md` | Auto-generated docs with install command and tool list |
| `tsconfig.json` | TypeScript configuration |

## Example

Given the Stripe API OpenAPI spec:

```
Input:  https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json
Auth:   API Key (header)
Select: customers, charges, payment_intents
```

Generates an MCP server with tools like:
- `list_customers` — List all customers with pagination
- `create_customer` — Create a customer with email, name, metadata
- `retrieve_charge` — Get charge details by ID
- `create_payment_intent` — Create a payment intent with amount, currency

Each tool has fully typed params, error handling, and Stripe-specific pagination support.

## Limitations

- OAuth 2.0 flows require manual credential setup after generation
- WebSocket/streaming APIs are not yet supported
- GraphQL APIs require the OpenAPI wrapper (not native GraphQL introspection)
- Generated servers target Node.js/TypeScript — no Python or Go output yet
