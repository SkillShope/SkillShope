# Output Structure

MCP Forge generates a complete, ready-to-run MCP server project.

## Directory Layout

```
<server-name>/
├── src/
│   ├── index.ts          # Server entry point — registers all tools
│   ├── auth.ts           # Auth provider (key injection, token refresh)
│   ├── client.ts         # HTTP client with base URL, headers, error handling
│   ├── config.ts         # Runtime config from environment variables
│   ├── types.ts          # TypeScript types from API schemas
│   └── tools/
│       ├── customers.ts  # Tools for /customers endpoints
│       ├── charges.ts    # Tools for /charges endpoints
│       └── ...           # One file per API resource group
├── package.json          # Dependencies + MCP server metadata
├── tsconfig.json         # TypeScript config
└── README.md             # Auto-generated install + usage docs
```

## Entry Point (src/index.ts)

Registers each tool with the MCP SDK:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCustomerTools } from "./tools/customers.js";
import { registerChargeTools } from "./tools/charges.js";

const server = new McpServer({ name: "stripe-mcp", version: "1.0.0" });

registerCustomerTools(server);
registerChargeTools(server);

// Start server
```

## Tool Files (src/tools/*.ts)

Each tool file exports a registration function:

```typescript
export function registerCustomerTools(server: McpServer) {
  server.tool("list_customers", { limit: z.number().optional() }, async (params) => {
    const response = await client.get("/customers", { params });
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  });

  server.tool("create_customer", { email: z.string(), name: z.string().optional() }, async (params) => {
    const response = await client.post("/customers", params);
    return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
  });
}
```

## Type Generation (src/types.ts)

Types are derived from OpenAPI schemas:

```typescript
export interface Customer {
  id: string;
  email: string;
  name: string | null;
  created: number;
  metadata: Record<string, string>;
}
```

## Error Handling

Every generated tool includes standardized error handling:

- HTTP 4xx errors return structured error messages to the AI
- HTTP 5xx errors return retry-friendly messages
- Network errors are caught and reported cleanly
- Rate limit responses (429) trigger automatic backoff

## Dependencies

Generated `package.json` includes only what's needed:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "zod": "^3.x"
  }
}
```

No bloated frameworks. Minimal dependency surface for security.
