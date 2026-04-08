import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@roughinhub.com" },
    update: {},
    create: {
      email: "admin@roughinhub.com",
      name: "RoughInHub",
      isAdmin: true,
    },
  });

  const blueprints = [
    {
      slug: "virginia-residential-bid-calculator-2026",
      name: "2026 Virginia Residential Bid Calculator with Local Material Costs",
      description: "Fully customizable Excel spreadsheet with current Virginia material & labor rates baked in. Automatically calculates job totals, markup, permits, and profit margin. Saves 3+ hours per bid and reduces underbidding mistakes. Includes tabs for service calls, bathroom remodels, and whole-house repipes. Updated for 2026 code changes.",
      longDescription: "This bid calculator is built by a Virginia plumber with 15+ years of experience bidding residential jobs. It includes current 2026 material costs from local suppliers, labor rate benchmarks for the Mid-Atlantic region, automatic markup and profit margin calculations, and separate tabs for different job types.\n\nIncludes: Service call estimates, bathroom remodel bids, whole-house repipe calculations, permit cost tables, and a profit margin analyzer. All formulas are unlocked so you can customize for your business.",
      category: "estimating-bidding",
      type: "excel",
      price: 29.0,
      isFree: false,
      region: "Virginia (and Mid-Atlantic)",
      tags: "bid calculator,residential,virginia,estimating,material costs",
      featured: true,
    },
    {
      slug: "plumbing-service-checklist-pack",
      name: "Professional Plumbing Service & Repair Checklist Pack (Digital + Printable)",
      description: "12 ready-to-use checklists covering water heater service, faucet repair, drain cleaning, leak detection, and toilet rebuilds. Includes pass/fail fields and customer sign-off sections. Prevents missed steps and protects you from \"you didn't fix it\" callbacks.",
      longDescription: "Stop relying on memory. These 12 professional checklists ensure you never miss a step on common plumbing service calls. Each checklist includes numbered steps, pass/fail checkboxes, notes fields, and a customer sign-off section for liability protection.\n\nCovers: Water heater service (tank + tankless), faucet repair, drain cleaning, leak detection, toilet rebuilds, garbage disposal install, sump pump service, and more. Print them out or use on a tablet.",
      category: "service-repair",
      type: "pdf",
      price: 19.0,
      isFree: false,
      region: "Nationwide",
      tags: "checklists,service,repair,water heater,drain cleaning",
      featured: true,
    },
    {
      slug: "plumbing-proposal-bundle",
      name: "Scope-of-Work Plumbing Proposal Template Bundle",
      description: "Editable proposal templates (Word + PDF) with professional formatting, scope-of-work breakdowns, material lists, timelines, and payment schedules. Includes change-order addendum to prevent scope creep. Used by plumbers who win 80%+ of the jobs they bid.",
      longDescription: "Win more jobs with professional proposals that clearly communicate scope, timeline, and pricing. This bundle includes 5 proposal templates covering different job types, each with detailed scope-of-work breakdowns, material lists, labor timelines, and payment schedules.\n\nAlso includes a change-order addendum template — the single most important document for preventing scope creep and protecting your profit margin. All templates are editable in Word.",
      category: "proposals-contracts",
      type: "zip-pack",
      price: 24.0,
      isFree: false,
      region: "Nationwide",
      tags: "proposals,contracts,scope of work,bidding,templates",
      featured: true,
    },
    {
      slug: "plumbing-service-agreement-pack",
      name: "Iron-Clad Residential Plumbing Service Agreement & Contract Pack",
      description: "Legally strong service agreement templates with clear warranty language, liability protection, emergency rates, and termination clauses. Reduces disputes and protects your business from common client claims. Includes both short service-call and full-project versions.",
      longDescription: "Protect your business with service agreements that have been battle-tested across hundreds of residential plumbing jobs. These templates include clear warranty language, liability limitations, emergency rate provisions, and termination clauses.\n\nIncludes: Short-form service call agreement, full-project service contract, warranty policy template, and emergency service addendum. All are editable and customizable per state.",
      category: "proposals-contracts",
      type: "pdf",
      price: 22.0,
      isFree: false,
      region: "Nationwide (customizable per state)",
      tags: "contracts,service agreement,legal,warranty,liability",
      featured: true,
    },
    {
      slug: "apprentice-training-kit-week1-4",
      name: "Apprentice Training Starter Kit – Week 1-4 Curriculum",
      description: "Complete beginner apprentice training materials: safety checklists, tool lists, basic copper sweating guide, drain/vent diagrams, quiz bank, and daily task sheets. Helps you train new hires faster and reduce costly mistakes on the job.",
      longDescription: "Training a new apprentice from scratch is expensive — every mistake costs you time and materials. This starter kit gives you a structured 4-week curriculum that covers all the basics: safety protocols, tool identification and care, basic copper sweating, drain and vent system diagrams, and daily task tracking.\n\nIncludes quizzes for each week to verify comprehension, daily task sheets for accountability, and a safety checklist that must be signed before any jobsite work.",
      category: "training",
      type: "zip-pack",
      price: 39.0,
      isFree: false,
      region: "Nationwide",
      tags: "apprentice,training,curriculum,safety,new hire",
      featured: false,
    },
    {
      slug: "insurance-claim-documentation-pack",
      name: "Insurance Claim Roofing & Plumbing Documentation Pack",
      description: "Photo logging template, before/after report format, and claim submission checklist that insurance companies actually accept. Includes language that maximizes approval rates for water damage and pipe burst claims.",
      longDescription: "Insurance claims for water damage and pipe bursts get denied all the time because of poor documentation. This pack gives you the exact templates and language that insurance adjusters expect to see.\n\nIncludes: Photo logging template with required angles and metadata, before/after damage report format, itemized repair estimate template, and a claim submission checklist. The language in these templates has been refined through dozens of successful claims.",
      category: "safety-compliance",
      type: "pdf",
      price: 27.0,
      isFree: false,
      region: "Nationwide",
      tags: "insurance,claims,documentation,water damage,compliance",
      featured: false,
    },
    {
      slug: "bathroom-rough-in-combo",
      name: "Bathroom Rough-In Bid & Checklist Combo",
      description: "Specialized bid calculator + installation checklist for bathroom rough-ins. Includes fixture counts, pipe sizing guide, and common code compliance items. Perfect for new construction or remodel bids.",
      longDescription: "Bathroom rough-ins are one of the most common plumbing jobs — and one of the easiest to underbid. This combo pack includes a specialized bid calculator for bathroom rough-ins and a step-by-step installation checklist.\n\nThe bid calculator accounts for fixture counts, pipe sizing, fitting quantities, and labor hours. The checklist covers code compliance items that inspectors commonly flag. Works for both new construction and remodel rough-ins.",
      category: "estimating-bidding",
      type: "zip-pack",
      price: 18.0,
      isFree: false,
      region: "Nationwide",
      tags: "bathroom,rough-in,bid calculator,checklist,new construction",
      featured: false,
    },
    {
      slug: "drain-cleaning-pricing-checklist",
      name: "Drain Cleaning & Snaking Service Pricing & Checklist",
      description: "Pricing matrix + job checklist for drain/snaking jobs. Helps you quote accurately by length, difficulty, and camera inspection add-ons while tracking time and materials.",
      longDescription: "Stop guessing on drain cleaning prices. This pricing matrix gives you a structured approach to quoting drain cleaning and snaking jobs based on drain length, difficulty level, and add-on services like camera inspections.\n\nThe job checklist tracks time, materials used, and findings for each job — useful for both billing accuracy and follow-up sales opportunities.",
      category: "service-repair",
      type: "excel",
      price: 15.0,
      isFree: false,
      region: "Nationwide",
      tags: "drain cleaning,snaking,pricing,service,checklist",
      featured: false,
    },
    {
      slug: "water-heater-proposal-guide",
      name: "Water Heater Replacement Proposal & Installation Guide",
      description: "Professional proposal template + step-by-step installation & removal checklist for tank and tankless water heaters. Includes efficiency upgrade upsell language and warranty transfer sections.",
      longDescription: "Water heater replacements are high-margin jobs when you present them professionally. This pack includes a polished proposal template that clearly presents options (standard vs. high-efficiency, tank vs. tankless) and an installation checklist that ensures nothing gets missed.\n\nThe proposal includes efficiency upgrade upsell language that helps customers choose higher-margin options, and warranty transfer sections that protect both you and the customer.",
      category: "proposals-contracts",
      type: "pdf",
      price: 21.0,
      isFree: false,
      region: "Nationwide",
      tags: "water heater,proposals,installation,tankless,upsell",
      featured: false,
    },
    {
      slug: "plumber-marketing-kit",
      name: "Marketing & Client Acquisition Kit for Solo Plumbers",
      description: "Ready-to-use Google review request scripts, before/after photo templates, Facebook/Nextdoor post examples, and referral discount flyers. Helps solo plumbers get more calls without expensive ads.",
      longDescription: "Most solo plumbers don't market because they don't know where to start. This kit gives you everything you need to get more calls without spending money on ads.\n\nIncludes: Google review request scripts (text and email), before/after photo templates for social media, 10 ready-to-post Facebook and Nextdoor examples, referral discount flyer templates, and a simple tracking sheet to see what's working. All designed for plumbers who are great at their trade but hate marketing.",
      category: "marketing",
      type: "zip-pack",
      price: 25.0,
      isFree: false,
      region: "Nationwide",
      tags: "marketing,reviews,social media,referrals,solo plumber",
      featured: false,
    },
  ];

  for (const bp of blueprints) {
    await prisma.blueprint.upsert({
      where: { slug: bp.slug },
      update: bp,
      create: {
        ...bp,
        authorId: admin.id,
        hidden: false,
      },
    });
  }

  console.log(`\n✅ 10 starter blueprints seeded successfully. Ready for manual file uploads by the admin.\n`);
  console.log(`Featured blueprints (first 4):`);
  blueprints.filter((b) => b.featured).forEach((b) => console.log(`  ⭐ ${b.name} — $${b.price.toFixed(2)}`));
  console.log(`\nAll blueprints set to published (hidden: false).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
