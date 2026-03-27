import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from "@/components/consent-banner";
import { Happie } from "@/components/happie";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Footer } from "@/components/footer";
import { Space_Grotesk, Jacques_Francois } from "next/font/google";

const jacquesFrancois = Jacques_Francois({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hero",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://skillshope.com";

export const metadata: Metadata = {
  title: {
    default: "Skill Shope — You Built It. Now Get Paid For It.",
    template: "%s | Skill Shope",
  },
  description:
    "The registry where AI skill creators keep 85%. Publish your skills, MCP servers, and agents — distributed in one command, protected by default.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  icons: { icon: "/logo-dark.svg", apple: "/icons/icon-192x192.png" },
  other: { "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes", "apple-mobile-web-app-status-bar-style": "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Skill Shope",
    title: "Skill Shope — You Built It. Now Get Paid For It.",
    description:
      "The registry where AI skill creators keep 85%. Publish your skills, MCP servers, and agents — distributed in one command, protected by default.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Shope — You Built It. Now Get Paid For It.",
    description:
      "The registry where AI skill creators keep 85%. Publish your skills, MCP servers, and agents — distributed in one command, protected by default.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={`min-h-screen antialiased ${spaceGrotesk.variable} ${jacquesFrancois.variable}`}>
        <Navbar user={session?.user} isAdmin={isAdmin} signOutButton={<SignOutButton />} />
        <main>{children}</main>
        <Footer />
        <Happie isSignedIn={!!session?.user} />
        <Analytics />
        <ServiceWorkerRegister />
        <ConsentBanner />
      </body>
    </html>
  );
}
