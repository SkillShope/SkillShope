import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Demo Publisher",
      email: "demo@roughinhub.dev",
      image: null,
      bio: "Construction estimator and blueprint creator.",
    },
  });

  const blueprints = [
    {
      slug: "residential-framing-estimate",
      name: "Residential Framing Estimate",
      description: "Complete framing takeoff template for single-family residential projects.",
      longDescription:
        "A comprehensive Excel-based framing estimate template that covers wall framing, floor systems, roof framing, and hardware. Pre-loaded with regional cost data and waste factors.\n\nIncludes labor and material breakdowns, summary sheets, and client-ready proposal format.",
      category: "framing",
      type: "pdf",
      isFree: true,
      downloads: 340,
      featured: true,
      tags: "framing,residential,estimate,excel",
    },
    {
      slug: "concrete-slab-calculator",
      name: "Concrete Slab Calculator",
      description: "Calculate concrete volume, rebar, and material costs for any slab project.",
      longDescription:
        "Handles rectangular, L-shaped, and irregular slabs. Computes yardage, rebar layout, form material, and pump costs automatically.\n\nIncludes vapor barrier and insulation options.",
      category: "concrete",
      type: "excel",
      isFree: false,
      price: 19.99,
      downloads: 210,
      featured: true,
      tags: "concrete,slab,calculator",
    },
    {
      slug: "rough-in-plumbing-checklist",
      name: "Rough-In Plumbing Checklist",
      description: "Inspector-ready checklist for residential rough-in plumbing inspections.",
      category: "plumbing",
      type: "pdf",
      isFree: true,
      downloads: 580,
      featured: false,
      tags: "plumbing,checklist,inspection",
    },
  ];

  for (const blueprint of blueprints) {
    await prisma.blueprint.create({
      data: {
        ...blueprint,
        authorId: user.id,
      },
    });
  }

  console.log(`Seeded ${blueprints.length} blueprints with 1 publisher.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
