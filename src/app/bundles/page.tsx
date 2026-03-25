import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BundlesList } from "@/components/bundles-list";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Curated collections of AI skills, MCP servers, and agents — designed to work together.",
};

export default async function BundlesPage() {
  const bundles = await prisma.bundle.findMany({
    include: {
      skills: {
        include: {
          skill: {
            select: {
              slug: true, name: true, type: true, description: true,
              isFree: true, price: true, securityScore: true,
            },
          },
        },
      },
      author: { select: { name: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <BundlesList
      bundles={bundles.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        price: b.price,
        isFree: b.isFree,
        discount: b.discount,
        featured: b.featured,
        authorName: b.author.name,
        skills: b.skills.map((bs) => ({
          slug: bs.skill.slug,
          name: bs.skill.name,
          type: bs.skill.type,
          isFree: bs.skill.isFree,
          price: bs.skill.price,
          securityScore: bs.skill.securityScore,
        })),
      }))}
    />
  );
}
