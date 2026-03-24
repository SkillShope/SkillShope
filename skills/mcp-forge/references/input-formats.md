# Input Formats

MCP Forge accepts API specifications in multiple formats and auto-detects the type.

## OpenAPI 3.x (Preferred)

The richest input format. Provides typed schemas, auth definitions, and endpoint descriptions.

```bash
# From URL
mcp-forge generate --spec https://api.example.com/openapi.json

# From local file
mcp-forge generate --spec ./openapi.yaml
```

**What's extracted:**
- All paths and operations (GET, POST, PUT, DELETE, PATCH)
- Request body schemas with required/optional fields
- Response schemas for type generation
- Security schemes (API key, OAuth, Bearer)
- Server URLs for base URL configuration
- Operation descriptions for tool documentation

## Swagger 2.0

Automatically converted to OpenAPI 3.x internally before processing.

```bash
mcp-forge generate --spec https://api.example.com/swagger.json
```

## API Documentation URL

When no formal spec exists, provide the docs URL. The AI agent reads the documentation and extracts:
- Available endpoints
- Request/response formats
- Authentication requirements
- Rate limiting info

```bash
mcp-forge generate --docs https://docs.example.com/api/reference
```

**Limitations:** Less precise than OpenAPI specs. May require manual adjustment of generated types.

## Manual Description

For simple APIs or internal tools without documentation:

```bash
mcp-forge generate --describe "REST API at api.internal.com/v2 with JWT auth.
  GET /users - list users, supports ?page and ?limit
  POST /users - create user with {name, email, role}
  GET /users/:id - get single user
  PUT /users/:id - update user
  DELETE /users/:id - delete user"
```

**Best for:** Internal APIs, prototyping, simple CRUD services.

## Auto-Detection

MCP Forge detects the input format by:

1. Checking for `openapi` or `swagger` keys in JSON/YAML
2. Checking Content-Type headers on URLs
3. Falling back to AI parsing for HTML documentation pages
4. Using the `--describe` flag for manual input
