import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
} from "docx";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();
const OUTPUT_DIR = join(process.cwd(), "scripts/artifacts");

const ORANGE = "FF6200";
const NAVY = "0A1628";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F5";

function docHeader(title: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: "[YOUR COMPANY NAME]", bold: true, size: 28, color: NAVY, font: "Arial" }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "[Phone] | [Email] | [License #]", size: 16, color: GRAY, font: "Arial" }),
      ],
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE } },
    }),
    new Paragraph({ spacing: { after: 120 } }),
    new Paragraph({
      children: [
        new TextRun({ text: title, bold: true, size: 32, color: NAVY, font: "Arial" }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

function jobInfoFields(): Paragraph[] {
  const field = (label: string) => new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 21, font: "Arial" }),
      new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
    ],
    spacing: { after: 80 },
  });

  return [
    field("Customer Name"),
    field("Address"),
    new Paragraph({
      children: [
        new TextRun({ text: "Date: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
        new TextRun({ text: "        Tech: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, bold: true, size: 24, color: ORANGE, font: "Arial" }),
    ],
    spacing: { before: 250, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" } },
  });
}

function equipmentList(items: string[]): Paragraph[] {
  return [
    sectionHeading("EQUIPMENT NEEDED"),
    ...items.map(item =>
      new Paragraph({
        children: [
          new TextRun({ text: "☐  ", size: 22, font: "Arial", color: ORANGE }),
          new TextRun({ text: item, size: 20, font: "Arial", color: "333333" }),
        ],
        spacing: { after: 60 },
        indent: { left: 200 },
      })
    ),
    new Paragraph({ spacing: { after: 150 } }),
  ];
}

function checklistTable(steps: string[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, size: 18, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 6, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Step", bold: true, size: 18, font: "Arial", color: "FFFFFF" })] })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 54, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Pass", bold: true, size: 18, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 8, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Fail", bold: true, size: 18, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 8, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "N/A", bold: true, size: 18, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 8, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Notes", bold: true, size: 18, font: "Arial", color: "FFFFFF" })] })],
            shading: { type: ShadingType.SOLID, color: NAVY },
            width: { size: 16, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Step rows
      ...steps.map((step, i) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${i + 1}`, size: 20, font: "Arial" })], alignment: AlignmentType.CENTER })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: step, size: 20, font: "Arial" })] })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "☐", size: 20, font: "Arial" })], alignment: AlignmentType.CENTER })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "☐", size: 20, font: "Arial" })], alignment: AlignmentType.CENTER })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "☐", size: 20, font: "Arial" })], alignment: AlignmentType.CENTER })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "", size: 20, font: "Arial" })] })],
              shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_GRAY } : undefined,
            }),
          ],
        })
      ),
    ],
  });
}

function customerSignoff(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 300 } }),
    sectionHeading("CUSTOMER SIGN-OFF"),
    new Paragraph({
      children: [
        new TextRun({ text: "Work described above has been completed to my satisfaction.", size: 20, font: "Arial", color: "333333" }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Customer Signature: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Printed Name: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
        new TextRun({ text: "    Date: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
    }),
  ];
}

// ============================================================
// Checklist Definitions
// ============================================================
const checklists = [
  {
    slug: "free-water-heater-service-checklist",
    title: "WATER HEATER SERVICE & INSPECTION CHECKLIST",
    filename: "water-heater-service-checklist.docx",
    equipment: [
      "Adjustable wrench",
      "Garden hose",
      "Leak detector solution",
      "Multimeter",
      "Thermometer",
      "Anode rod socket (1-1/16\")",
      "Bucket",
      "Teflon tape",
    ],
    steps: [
      "Turn off gas/power supply to unit",
      "Check T&P relief valve for proper operation (lift and release lever)",
      "Inspect flue/venting for blockage, corrosion, or disconnection",
      "Check all gas connections with leak detector solution",
      "Inspect burner assembly (gas) or heating elements (electric)",
      "Check thermostat settings and operation (target 120F)",
      "Drain 2-3 gallons to flush sediment buildup",
      "Inspect anode rod condition (replace if less than 1/2\" diameter)",
      "Check for water leaks at all connections and fittings",
      "Inspect expansion tank pressure (if present, match system pressure)",
      "Verify proper clearances from combustible materials",
      "Test hot water temperature at nearest fixture (target 120F)",
      "Document unit age, model number, and serial number",
      "Advise customer on remaining useful life estimate and any concerns",
    ],
  },
  {
    slug: "free-drain-cleaning-job-checklist",
    title: "DRAIN CLEANING & SNAKING JOB CHECKLIST",
    filename: "drain-cleaning-job-checklist.docx",
    equipment: [
      "Drain machine (3/8\" or 3/4\" cable)",
      "Drop cloths / plastic sheeting",
      "Bucket",
      "Camera inspection system (if applicable)",
      "Gloves + safety glasses",
      "Cleanout wrench / plug wrench",
      "Garden hose",
      "Disinfectant / enzyme cleaner",
    ],
    steps: [
      "Identify affected drain(s) and symptoms with customer",
      "Locate nearest cleanout access point",
      "Lay drop cloths to protect flooring and surrounding area",
      "Set up drain machine with appropriate cable size for the line",
      "Feed cable into cleanout - note footage reading at obstruction",
      "Clear obstruction - note type (grease, roots, debris, scale, etc.)",
      "Retrieve cable, inspect head for damage or material caught",
      "Run water for 3-5 minutes to verify drain flows freely",
      "Camera inspect line if included in scope (document findings)",
      "Clean work area and remove all debris / soiled materials",
      "Recommend follow-up treatment if needed (root killer, enzyme)",
      "Advise customer on preventative maintenance and warning signs",
    ],
  },
  {
    slug: "free-faucet-repair-checklist",
    title: "FAUCET REPAIR & REPLACEMENT CHECKLIST",
    filename: "faucet-repair-checklist.docx",
    equipment: [
      "Basin wrench",
      "Adjustable wrench (2 sizes)",
      "Allen key set (metric + standard)",
      "Plumber's grease / silicone lubricant",
      "Replacement cartridge or repair kit",
      "Plumber's tape (teflon)",
      "Towels / rags",
      "Bucket or small container",
    ],
    steps: [
      "Identify faucet brand, model, and type (compression / cartridge / ball / disc)",
      "Turn off hot and cold shut-off valves under sink",
      "Open faucet to relieve pressure and confirm water is off",
      "Place towel in sink basin to catch small parts and prevent scratches",
      "Remove handle(s) and decorative trim pieces",
      "Inspect cartridge, stem, seats, and O-rings for wear or damage",
      "Replace worn components (cartridge, O-rings, seats, springs as needed)",
      "Apply plumber's grease to O-rings and moving parts before reassembly",
      "Reassemble faucet in reverse order - hand-tighten first, then snug",
      "Turn on supply valves slowly - check for leaks at all connections",
      "Test hot and cold operation, check handle movement and temperature",
      "Check under sink for drips after 5 minutes of operation",
    ],
  },
];

async function main() {
  const { mkdirSync } = await import("fs");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("\nUpgrading checklists to professional Word documents...\n");

  const blobToken = process.env.BLOB_DEV_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("No blob token found.");
    return;
  }

  for (const cl of checklists) {
    // Generate Word document
    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } },
        },
        children: [
          ...docHeader(cl.title),
          ...jobInfoFields(),
          ...equipmentList(cl.equipment),
          sectionHeading("INSPECTION STEPS"),
          new Paragraph({ spacing: { after: 80 } }),
          checklistTable(cl.steps),
          ...customerSignoff(),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const path = join(OUTPUT_DIR, cl.filename);
    await writeFile(path, buffer);

    // Find blueprint and update
    const blueprint = await prisma.blueprint.findUnique({ where: { slug: cl.slug } });
    if (!blueprint) {
      console.error(`  Blueprint not found: ${cl.slug}`);
      continue;
    }

    // Update type
    await prisma.blueprint.update({
      where: { id: blueprint.id },
      data: { type: "doc" },
    });

    // Upload to Blob
    const fileBuffer = await readFile(path);
    const blob = await put(`blueprints/${blueprint.id}/${cl.filename}`, fileBuffer, {
      access: "private",
      addRandomSuffix: true,
      token: blobToken,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Replace file records
    await prisma.blueprintFile.deleteMany({ where: { blueprintId: blueprint.id } });
    await prisma.blueprintFile.create({
      data: {
        blueprintId: blueprint.id,
        filename: cl.filename,
        blobUrl: blob.url,
        size: fileBuffer.length,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });

    console.log(`  ✓ ${cl.title} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n✅ 3 checklists upgraded to professional Word documents.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
