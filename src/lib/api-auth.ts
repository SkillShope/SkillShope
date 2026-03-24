import { createHash } from "crypto";
import { prisma } from "./prisma";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "sk_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Authenticate via Bearer token, returns user ID or null
export async function authenticateApiKey(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer sk_")) return null;

  const key = authHeader.slice(7); // Remove "Bearer "
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { userId: true, id: true },
  });

  if (!apiKey) return null;

  // Update last used (non-blocking)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(() => {});

  return apiKey.userId;
}
