import NextAuth from "next-auth";
import type { Adapter, AdapterAccount } from "@auth/core/adapters";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { encrypt, decrypt, isEncrypted } from "./crypto";

const TOKEN_FIELDS = ["access_token", "refresh_token", "id_token"] as const;

type AccountData = AdapterAccount & Record<string, unknown>;

function encryptTokenFields<T extends Record<string, unknown>>(data: T): T {
  const copy = { ...data };
  for (const field of TOKEN_FIELDS) {
    const val = copy[field];
    if (typeof val === "string" && val.length > 0 && !isEncrypted(val)) {
      (copy as Record<string, unknown>)[field] = encrypt(val);
    }
  }
  return copy;
}

function decryptTokenFields<T extends Record<string, unknown>>(data: T): T {
  const copy = { ...data };
  for (const field of TOKEN_FIELDS) {
    const val = copy[field];
    if (typeof val === "string" && val.length > 0 && isEncrypted(val)) {
      try {
        (copy as Record<string, unknown>)[field] = decrypt(val);
      } catch {
        // If decryption fails, leave the value as-is (may be plaintext pre-migration)
      }
    }
  }
  return copy;
}

const baseAdapter = PrismaAdapter(prisma);

const encryptedAdapter: Adapter = {
  ...baseAdapter,
  linkAccount: async (data: AdapterAccount) => {
    const encrypted = encryptTokenFields(data as AccountData);
    await baseAdapter.linkAccount!(encrypted as AdapterAccount);
  },
  getAccount: async (providerAccountId: string, provider: string) => {
    const account = await baseAdapter.getAccount!(providerAccountId, provider);
    if (account) {
      return decryptTokenFields(account as AccountData) as AdapterAccount;
    }
    return account;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: encryptedAdapter,
  providers: [GitHub],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
