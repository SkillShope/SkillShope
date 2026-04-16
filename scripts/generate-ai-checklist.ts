import PDFDocument from "pdfkit";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

async function generatePDF(): Promise<string> {
  const outDir = join(__dirname, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "ai-checklist-for-plumbers.pdf");

  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 60, bottom: 60, left: 55, right: 55 },
    info: {
      Title: "The Plumber's AI Checklist",
      Author: "RoughInHub",
      Subject: "15 ways to use AI in your plumbing business this week",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const black = "#1a1a1a";
  const gray = "#555555";
  const accent = "#e85d2a";
  const lightBg = "#f8f5f2";

  // ── Header ──
  doc
    .rect(0, 0, doc.page.width, 130)
    .fill(black);

  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor("#ffffff")
    .text("The Plumber's AI Checklist", 55, 40, { width: 500 });

  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#cccccc")
    .text("15 ways to use AI in your plumbing business this week", 55, 78, { width: 500 });

  doc
    .fontSize(10)
    .fillColor("#999999")
    .text("roughinhub.com", 55, 105);

  doc.y = 155;

  // ── Intro ──
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(gray)
    .text(
      "AI won't replace plumbers. But plumbers who use AI will outperform those who don't. This checklist covers the highest-impact ways to put AI to work in your business today -- no technical background needed. Each item takes 5 minutes or less to try.",
      { width: 500, lineGap: 3 }
    );

  doc.moveDown(0.8);

  // ── Sections ──
  const sections = [
    {
      title: "BIDDING & ESTIMATING",
      color: accent,
      items: [
        {
          check: "Generate scope-of-work language for proposals",
          detail:
            'Paste your job notes into ChatGPT or Claude and ask: "Write a professional scope of work for this plumbing job." Edit the output, don\'t send it blind -- but it cuts proposal writing from 30 minutes to 5.',
        },
        {
          check: "Write estimate cover letters that win jobs",
          detail:
            "A one-paragraph cover letter on your estimate sets you apart from every plumber who sends a bare number. Ask AI to write one that emphasizes your reliability, warranty, and licensing.",
        },
        {
          check: "Double-check material quantities before ordering",
          detail:
            'Describe the job and ask AI to list the fittings, pipe lengths, and supplies you\'ll need. It won\'t replace your experience, but it catches the "did I remember the transition fittings?" moments.',
        },
      ],
    },
    {
      title: "CUSTOMER COMMUNICATION",
      color: "#2563eb",
      items: [
        {
          check: "Draft responses to Google reviews (good and bad)",
          detail:
            'For positive reviews: a quick "thank you" that mentions the specific work builds SEO. For negative reviews: AI helps you write a calm, professional response when you\'re tempted to fire back.',
        },
        {
          check: "Write follow-up texts after service calls",
          detail:
            '"Hi [Name], just checking that everything is working well after yesterday\'s repair. If anything comes up, call me directly." Takes 10 seconds to personalize. Most plumbers never follow up -- the ones who do get the referrals.',
        },
        {
          check: "Create FAQ responses for common customer questions",
          detail:
            'Build a list of the 10 questions you hear most ("How much does a water heater cost?" "Do I need a permit?") and have AI draft clear, professional answers. Save them in your phone for quick copy-paste.',
        },
      ],
    },
    {
      title: "MARKETING & REPUTATION",
      color: "#16a34a",
      items: [
        {
          check: "Write Google Business Profile posts weekly",
          detail:
            'Google rewards businesses that post updates. Ask AI: "Write a short Google Business post about [seasonal plumbing tip / completed job / service you offer]." Post it in 2 minutes.',
        },
        {
          check: "Generate social media captions from job photos",
          detail:
            "You already take before/after photos. Upload one to ChatGPT and ask for a Facebook or Nextdoor caption. Real job photos with solid captions are the best-performing content for local trades.",
        },
        {
          check: "Draft a referral request email or text",
          detail:
            'Happy customers are willing to refer you, but they need a nudge. AI can write a non-pushy referral ask: "If you know anyone who needs a plumber, I\'d appreciate the recommendation. Here\'s my number."',
        },
      ],
    },
    {
      title: "OPERATIONS & COMPLIANCE",
      color: "#9333ea",
      items: [
        {
          check: "Look up code requirements in plain English",
          detail:
            'Plumbing codes are written in legalese. Ask AI: "Explain the IPC requirements for bathroom rough-in venting in plain English." Always verify against the actual code, but AI makes the first read much faster.',
        },
        {
          check: "Generate jobsite safety documentation",
          detail:
            "OSHA requires documented safety protocols. AI can draft hazard assessments, confined space procedures, and PPE checklists tailored to plumbing work. Print them and bring them to every job.",
        },
        {
          check: "Create training checklists for new apprentices",
          detail:
            'Describe what your apprentice needs to learn in their first month and ask AI to structure it as a week-by-week training plan. Structured onboarding means fewer costly mistakes.',
        },
      ],
    },
    {
      title: "MONEY & ADMIN",
      color: "#dc2626",
      items: [
        {
          check: "Draft change order language on the spot",
          detail:
            'Customer says "while you\'re here, can you also..." and now scope is creeping. Tell AI the additional work and get professional change order language in 30 seconds. Protects your margin.',
        },
        {
          check: "Write professional dispute resolution emails",
          detail:
            "When a customer disputes a charge or claims work wasn't done right, emotions run high. AI drafts a calm, factual email that protects your position without burning the relationship.",
        },
        {
          check: "Summarize your financials in plain language",
          detail:
            'Paste your monthly P&L numbers into AI and ask: "What should I be concerned about?" It won\'t replace your accountant, but it helps you spot trends between meetings.',
        },
      ],
    },
  ];

  for (const section of sections) {
    // Check if we need a new page (need ~180px for a section header + first item)
    if (doc.y > 560) {
      doc.addPage();
      doc.y = 60;
    }

    // Section header -- simple bold text with a thin underline
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(black)
      .text(section.title, 55, doc.y, { width: 500 });

    doc
      .moveTo(55, doc.y + 2)
      .lineTo(555, doc.y + 2)
      .lineWidth(0.5)
      .strokeColor("#cccccc")
      .stroke();

    doc.moveDown(0.5);

    for (const item of section.items) {
      // Check if we need a new page for this item
      if (doc.y > 640) {
        doc.addPage();
        doc.y = 60;
      }

      // Checkbox
      doc
        .rect(60, doc.y, 11, 11)
        .lineWidth(0.75)
        .strokeColor("#999999")
        .stroke();

      // Item title
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(black)
        .text(item.check, 80, doc.y + 1, { width: 470 });

      doc.moveDown(0.3);

      // Item detail
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(gray)
        .text(item.detail, 80, doc.y, { width: 470, lineGap: 2 });

      doc.moveDown(0.6);
    }

    doc.moveDown(0.4);
  }

  // ── Getting Started box ──
  if (doc.y > 520) {
    doc.addPage();
    doc.y = 60;
  }

  // Section header for Getting Started
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(black)
    .text("GETTING STARTED", 55, doc.y, { width: 500 });

  doc
    .moveTo(55, doc.y + 2)
    .lineTo(555, doc.y + 2)
    .lineWidth(0.5)
    .strokeColor("#cccccc")
    .stroke();

  doc.moveDown(0.5);

  const tips = [
    "Pick one item from this checklist and try it today. Don't try to adopt everything at once.",
    'Use ChatGPT (free) or Claude (free tier available). Both work for everything on this list. Open it on your phone between jobs.',
    'Start every request with context: "I\'m a licensed plumber in [state]. I need..." The more context you give, the better the output.',
    "Never trust AI for final code compliance, legal advice, or medical gas specifications. Use it as a starting point, then verify.",
    "Save your best prompts in your phone's notes app. Once you find wording that works, reuse it.",
  ];

  tips.forEach((tip, i) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(black)
      .text(`${i + 1}.`, 60, doc.y, { continued: true, width: 490 });

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(gray)
      .text(`  ${tip}`, { width: 475, lineGap: 1 });

    doc.moveDown(0.2);
  });

  // ── Footer ──
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(gray)
    .text(
      "Free download from RoughInHub -- bid calculators, checklists, contracts, and templates for plumbers.",
      55,
      doc.y,
      { width: 500, align: "center" }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(accent)
    .text("roughinhub.com/browse", 55, doc.y, {
      width: 500,
      align: "center",
      link: "https://roughinhub.com/browse",
    });

  doc.end();

  // Wait for stream to finish
  await new Promise<void>((resolve) => doc.on("end", resolve));
  const buffer = Buffer.concat(chunks);
  writeFileSync(outPath, buffer);
  return outPath;
}

async function main() {
  console.log("Generating AI Checklist PDF...");
  const filePath = await generatePDF();
  const fileBuffer = readFileSync(filePath);
  console.log(`  Generated: ${(fileBuffer.length / 1024).toFixed(1)} KB`);

  // Find admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@roughinhub.com" },
    update: {},
    create: { email: "admin@roughinhub.com", name: "RoughInHub", isAdmin: true },
  });

  const slug = "free-ai-checklist-for-plumbers";

  // Create/update blueprint
  const blueprint = await prisma.blueprint.upsert({
    where: { slug },
    update: {
      name: "The Plumber's AI Checklist: 15 Ways to Use AI in Your Business",
      description:
        "Practical, no-BS checklist of 15 ways plumbers can use AI to write better bids, respond to reviews, generate marketing content, and run a tighter business. No technical background needed.",
      longDescription:
        "AI won't replace plumbers. But plumbers who use AI will outperform those who don't. This checklist covers the highest-impact ways to put AI to work in your plumbing business today.\n\nCovers 5 areas: Bidding & Estimating (scope-of-work generation, estimate cover letters, material quantity checks), Customer Communication (review responses, follow-up texts, FAQ templates), Marketing & Reputation (Google Business posts, social captions, referral asks), Operations & Compliance (code lookups, safety docs, apprentice training), and Money & Admin (change orders, dispute emails, financial summaries).\n\nEach item takes 5 minutes or less to try. Includes a Getting Started section with tool recommendations and the prompts that actually work.",
      category: "training",
      type: "pdf",
      region: "Nationwide",
      tags: "ai,artificial intelligence,chatgpt,productivity,free,checklist",
      isFree: true,
      price: 0,
      featured: true,
      hidden: false,
      contentAcknowledgedAt: new Date(),
    },
    create: {
      slug,
      name: "The Plumber's AI Checklist: 15 Ways to Use AI in Your Business",
      description:
        "Practical, no-BS checklist of 15 ways plumbers can use AI to write better bids, respond to reviews, generate marketing content, and run a tighter business. No technical background needed.",
      longDescription:
        "AI won't replace plumbers. But plumbers who use AI will outperform those who don't. This checklist covers the highest-impact ways to put AI to work in your plumbing business today.\n\nCovers 5 areas: Bidding & Estimating (scope-of-work generation, estimate cover letters, material quantity checks), Customer Communication (review responses, follow-up texts, FAQ templates), Marketing & Reputation (Google Business posts, social captions, referral asks), Operations & Compliance (code lookups, safety docs, apprentice training), and Money & Admin (change orders, dispute emails, financial summaries).\n\nEach item takes 5 minutes or less to try. Includes a Getting Started section with tool recommendations and the prompts that actually work.",
      category: "training",
      type: "pdf",
      region: "Nationwide",
      tags: "ai,artificial intelligence,chatgpt,productivity,free,checklist",
      isFree: true,
      price: 0,
      featured: true,
      hidden: false,
      contentAcknowledgedAt: new Date(),
      authorId: admin.id,
    },
  });

  // Upload to Vercel Blob
  const blobToken =
    process.env.BLOB_DEV_READ_WRITE_TOKEN || process.env.BLOB_PROD_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("No blob token found. Set BLOB_DEV_READ_WRITE_TOKEN in .env.local");
    return;
  }

  const filename = "ai-checklist-for-plumbers.pdf";
  const blob = await put(`blueprints/${blueprint.id}/${filename}`, fileBuffer, {
    access: "private",
    addRandomSuffix: true,
    token: blobToken,
    contentType: "application/pdf",
  });

  // Replace existing files (idempotent re-runs)
  await prisma.blueprintFile.deleteMany({ where: { blueprintId: blueprint.id } });

  await prisma.blueprintFile.create({
    data: {
      blueprintId: blueprint.id,
      filename,
      blobUrl: blob.url,
      size: fileBuffer.length,
      mimeType: "application/pdf",
    },
  });

  console.log(`  Uploaded to Vercel Blob: ${blob.url.substring(0, 60)}...`);
  console.log(`\n  Blueprint: ${blueprint.name}`);
  console.log(`  Slug: ${blueprint.slug}`);
  console.log(`  URL: roughinhub.com/blueprints/${blueprint.slug}`);
  console.log(`\nDone.\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
