// API authentication utilities (not currently used)

export function hashKey(key: string): string {
  const { createHash } = require("crypto");
  return createHash("sha256").update(key).digest("hex");
}

export async function authenticateRequest(
  _authHeader: string | null
): Promise<string | null> {
  return null;
}
