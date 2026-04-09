import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from "@/components/consent-banner";
import { Footer } from "@/components/footer";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoughInHub — Real Plumbing Blueprints from Real Plumbers",
  description:
    "Buy battle-tested plumbing bid calculators, checklists, proposals, contracts, and training materials from experienced plumbers. Instant access, automatic updates.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "335x335", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "RoughInHub — Real Plumbing Blueprints from Real Plumbers",
    description:
      "Buy battle-tested plumbing bid calculators, checklists, proposals, contracts, and training materials from experienced plumbers.",
    type: "website",
    siteName: "RoughInHub",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading headers forces dynamic rendering — required for per-request CSP nonces
  await headers();
  const session = await auth();

  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    isAdmin = user?.isAdmin ?? false;
  }

  return (
    <html lang="en">
      <body className={`min-h-screen antialiased ${spaceGrotesk.variable}`}>
        <Navbar user={session?.user} isAdmin={isAdmin} signOutButton={<SignOutButton />} />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
