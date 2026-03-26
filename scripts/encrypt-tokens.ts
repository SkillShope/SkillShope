/**
 * One-time migration: encrypts existing plaintext OAuth tokens in the Account table.
 *
 * Usage: TOKEN_ENCRYPTION_KEY=<base64-key> npx tsx scripts/encrypt-tokens.ts
 *
 * To generate a key:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

import { PrismaClient } from "@prisma/client";
import { encrypt, isEncrypted } from "../src/lib/crypto";

const prisma = new PrismaClient();
const TOKEN_FIELDS = ["access_token", "refresh_token", "id_token"] as const;

async function main() {
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error("TOKEN_ENCRYPTION_KEY is required.");
    console.error(
      'Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
    );
    process.exit(1);
  }

  const accounts = await prisma.account.findMany();
  console.log(`Found ${accounts.length} account(s)`);

  let updated = 0;

  for (const account of accounts) {
    const changes: Record<string, string> = {};

    for (const field of TOKEN_FIELDS) {
      const val = account[field];
      if (typeof val === "string" && val.length > 0 && !isEncrypted(val)) {
        changes[field] = encrypt(val);
      }
    }

    if (Object.keys(changes).length > 0) {
      await prisma.account.update({
        where: { id: account.id },
        data: changes,
      });
      updated++;
      console.log(`Encrypted tokens for account ${account.id} (${account.provider})`);
    }
  }

  console.log(`Done. ${updated} account(s) updated, ${accounts.length - updated} already encrypted.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
