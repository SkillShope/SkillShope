import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

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

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar user={session?.user} signOutButton={<SignOutButton />} />
        <main>{children}</main>
      </body>
    </html>
  );
}
