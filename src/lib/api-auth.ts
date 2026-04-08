import { createHash } from "crypto";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "sk_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// API key auth is not implemented in this version
export async function authenticateApiKey(
  _authHeader: string | null
): Promise<string | null> {
  return null;
}
