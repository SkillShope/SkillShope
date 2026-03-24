import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from "@/components/consent-banner";
import { Happie } from "@/components/happie";
import { Jaro, Space_Grotesk, Jacques_Francois } from "next/font/google";

const jaro = Jaro({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
    default: "Skill Shope — The AI Skills Registry",
    template: "%s | Skill Shope",
  },
  description:
    "Discover, review, and install AI skills, MCP servers, and agent configurations. The registry for the agentic era.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Skill Shope",
    title: "Skill Shope — The AI Skills Registry",
    description:
      "Discover, review, and install AI skills, MCP servers, and agent configurations from verified publishers.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Shope — The AI Skills Registry",
    description:
      "Discover, review, and install AI skills, MCP servers, and agent configurations from verified publishers.",
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
      <body className={`min-h-screen antialiased ${jaro.variable} ${spaceGrotesk.variable} ${jacquesFrancois.variable}`}>
        <Navbar user={session?.user} isAdmin={isAdmin} signOutButton={<SignOutButton />} />
        <main>{children}</main>
        <Happie />
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
