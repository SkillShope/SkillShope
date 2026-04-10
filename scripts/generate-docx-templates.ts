import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopPosition,
  TabStopType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();
const OUTPUT_DIR = join(process.cwd(), "scripts/artifacts");

// Shared styles
const ORANGE = "FF6200";
const NAVY = "0A1628";
const GRAY = "666666";

function companyHeader(): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "[YOUR COMPANY NAME]",
          bold: true,
          size: 36,
          color: NAVY,
          font: "Arial",
        }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "[Address] | [Phone] | [Email] | [License #]",
          size: 18,
          color: GRAY,
          font: "Arial",
        }),
      ],
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE },
      },
    }),
    new Paragraph({ spacing: { after: 200 } }),
  ];
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: NAVY,
        font: "Arial",
      }),
    ],
    spacing: { before: 300, after: 120 },
  });
}

function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        size: 21,
        font: "Arial",
        color: "333333",
      }),
    ],
    spacing: { after: 120 },
  });
}

function signatureBlock(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 400, after: 200 } }),
    new Paragraph({
      children: [
        new TextRun({ text: "SIGNATURES", bold: true, size: 24, color: NAVY, font: "Arial" }),
      ],
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
      },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Contractor: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
        new TextRun({ text: "    Date: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Customer: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
        new TextRun({ text: "    Date: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

function fieldRow(label: string, placeholder: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 21, font: "Arial" }),
      new TextRun({ text: placeholder, size: 21, font: "Arial", color: GRAY }),
    ],
    spacing: { after: 80 },
  });
}

// ============================================================
// 1. Residential Plumbing Proposal
// ============================================================
async function createResidentialProposal(): Promise<string> {
  const scopeItems = [
    "Remove and dispose of existing plumbing fixtures as specified",
    "Rough-in new supply and drain lines per approved layout",
    "Install new fixtures (toilet, vanity, shower valve) per customer selection",
    "Connect all fixtures to existing supply and drain systems",
    "Pressure test all new supply lines at 80 PSI for 30 minutes",
    "Final inspection coordination with local building department",
    "Clean up all work areas and remove debris daily",
  ];

  const materials: [string, string][] = [
    ["Copper supply pipe + fittings", "$185.00"],
    ["ABS/PVC drain pipe + fittings", "$120.00"],
    ["Shut-off valves (1/4 turn)", "$48.00"],
    ["Shower valve (pressure balance)", "$165.00"],
    ["Toilet flange + wax ring", "$25.00"],
    ["P-traps + drain assemblies", "$45.00"],
    ["Misc. hangers, clamps, sealant", "$60.00"],
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
        },
      },
      children: [
        ...companyHeader(),

        // Title
        new Paragraph({
          children: [
            new TextRun({ text: "PLUMBING PROPOSAL", bold: true, size: 32, color: ORANGE, font: "Arial" }),
            new TextRun({ text: "  -  Residential Remodel", size: 32, color: NAVY, font: "Arial" }),
          ],
          spacing: { after: 300 },
        }),

        // Client info
        fieldRow("Prepared for", "[Customer Name]"),
        fieldRow("Property address", "[Address]"),
        fieldRow("Date", "[Date]"),
        fieldRow("Proposal valid for", "30 days from date above"),

        new Paragraph({ spacing: { after: 200 } }),

        // Scope of Work
        sectionTitle("SCOPE OF WORK"),
        bodyText("The following work will be performed at the property address listed above:"),
        ...scopeItems.map((item, i) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, size: 21, font: "Arial", color: ORANGE }),
              new TextRun({ text: item, size: 21, font: "Arial", color: "333333" }),
            ],
            spacing: { after: 80 },
            indent: { left: 200 },
          })
        ),

        new Paragraph({ spacing: { after: 200 } }),

        // Materials
        sectionTitle("MATERIALS ESTIMATE"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true, size: 20, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.LEFT })],
                  shading: { type: ShadingType.SOLID, color: ORANGE },
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Est. Cost", bold: true, size: 20, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.RIGHT })],
                  shading: { type: ShadingType.SOLID, color: ORANGE },
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            ...materials.map(([item, cost], i) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item, size: 20, font: "Arial" })] })],
                    shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: "F5F5F5" } : undefined,
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cost, size: 20, font: "Arial" })], alignment: AlignmentType.RIGHT })],
                    shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: "F5F5F5" } : undefined,
                  }),
                ],
              })
            ),
          ],
        }),

        new Paragraph({ spacing: { after: 200 } }),

        // Timeline
        sectionTitle("TIMELINE"),
        bodyText("Estimated 3-4 working days from start date. Schedule dependent on fixture availability and inspection timing. Contractor will provide a firm start date upon acceptance of this proposal."),

        // Payment Terms
        sectionTitle("PAYMENT TERMS"),
        bodyText("50% deposit due upon acceptance of this proposal."),
        bodyText("Remaining 50% due upon completion of work."),
        bodyText("Accepted forms of payment: Check, Credit Card, Zelle, Venmo."),
        bodyText("Late payments subject to 1.5% monthly interest after 30 days."),

        // Change Orders
        sectionTitle("CHANGE ORDERS"),
        bodyText("Any work beyond the scope described above requires a written change order signed by both parties before additional work begins. Change orders will be billed at the agreed hourly rate plus materials at cost plus 25% markup."),

        // Warranty
        sectionTitle("WARRANTY"),
        bodyText("All labor is warranted for one (1) year from the date of completion. Manufacturer warranties on parts and fixtures are passed through to the customer. This warranty does not cover damage caused by misuse, neglect, or acts of nature."),

        ...signatureBlock(),

        new Paragraph({
          children: [
            new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const path = join(OUTPUT_DIR, "residential-plumbing-proposal.docx");
  await writeFile(path, buffer);
  return path;
}

// ============================================================
// 2. Emergency Repair Proposal
// ============================================================
async function createEmergencyProposal(): Promise<string> {
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
      },
      children: [
        ...companyHeader(),

        new Paragraph({
          children: [
            new TextRun({ text: "EMERGENCY PLUMBING REPAIR", bold: true, size: 32, color: ORANGE, font: "Arial" }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "PROPOSAL", bold: true, size: 32, color: NAVY, font: "Arial" }),
          ],
          spacing: { after: 300 },
        }),

        fieldRow("Prepared for", "[Customer Name]"),
        fieldRow("Property address", "[Address]"),
        fieldRow("Date / Time of call", "[Date and Time]"),
        fieldRow("Proposal valid for", "24 hours (emergency pricing)"),

        new Paragraph({ spacing: { after: 200 } }),

        sectionTitle("EMERGENCY DESCRIPTION"),
        bodyText("[Describe the emergency: e.g., burst pipe in basement, active flooding from second floor bathroom, sewage backup through floor drain]"),

        new Paragraph({ spacing: { after: 100 } }),

        sectionTitle("SCOPE OF WORK"),
        ...[
          "Locate and isolate source of leak/damage",
          "Perform temporary repair to stop active water damage",
          "Assess full scope of permanent repair needed",
          "Complete permanent repair using code-compliant materials",
          "Test repair under full system pressure",
          "Document all work with photos for insurance purposes",
        ].map((item, i) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}.  `, bold: true, size: 21, font: "Arial", color: ORANGE }),
              new TextRun({ text: item, size: 21, font: "Arial", color: "333333" }),
            ],
            spacing: { after: 80 },
            indent: { left: 200 },
          })
        ),

        new Paragraph({ spacing: { after: 200 } }),

        sectionTitle("PRICING"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Item", bold: true, size: 20, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.LEFT })],
                  shading: { type: ShadingType.SOLID, color: ORANGE },
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true, size: 20, font: "Arial", color: "FFFFFF" })], alignment: AlignmentType.RIGHT })],
                  shading: { type: ShadingType.SOLID, color: ORANGE },
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            ...([
              ["Emergency dispatch fee", "$75.00"],
              ["Emergency labor - first 2 hours", "$350.00"],
              ["Additional labor (per hour after)", "$125.00/hr"],
              ["Repair materials (pipe, fittings, valves)", "At cost + 25%"],
              ["Water damage mitigation supplies", "At cost + 25%"],
            ] as [string, string][]).map(([item, cost], i) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: item, size: 20, font: "Arial" })] })],
                    shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: "F5F5F5" } : undefined,
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cost, size: 20, font: "Arial" })], alignment: AlignmentType.RIGHT })],
                    shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: "F5F5F5" } : undefined,
                  }),
                ],
              })
            ),
          ],
        }),

        new Paragraph({ spacing: { after: 200 } }),

        sectionTitle("TIMELINE"),
        bodyText("Emergency repairs begin immediately upon approval. Permanent repairs completed within 24-48 hours pending parts availability."),

        sectionTitle("INSURANCE DOCUMENTATION"),
        bodyText("All work will be photographed before, during, and after repair for insurance claim purposes. A detailed report of findings and repairs will be provided upon completion. Contractor will cooperate with insurance adjuster if needed."),

        sectionTitle("PAYMENT"),
        bodyText("Emergency repairs require payment in full upon completion. Accepted: Credit Card, Check, Zelle, Venmo."),

        ...signatureBlock(),

        new Paragraph({
          children: [
            new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const path = join(OUTPUT_DIR, "emergency-repair-proposal.docx");
  await writeFile(path, buffer);
  return path;
}

// ============================================================
// 3. Plumbing Service Agreement
// ============================================================
async function createServiceAgreement(): Promise<string> {
  const clauses: [string, string][] = [
    ["SCOPE OF WORK", "Contractor agrees to perform plumbing services as described in the attached proposal/estimate. Any work beyond the original scope requires a written change order signed by both parties before work begins. Verbal agreements for additional work are not binding."],
    ["PAYMENT TERMS", "Customer agrees to pay 50% of the total estimated cost as a deposit before work begins. The remaining balance is due upon completion of work. Late payments are subject to 1.5% monthly interest. Contractor reserves the right to halt work if payments are not received as agreed. A $35 fee will be charged for returned checks."],
    ["WARRANTY", "Contractor warrants all labor for a period of one (1) year from the date of completion. If any defect in workmanship appears during this period, Contractor will repair it at no additional charge, provided the defect is not caused by misuse, modification, or neglect by Customer or third parties. Manufacturer warranties on parts and fixtures are passed through to the Customer."],
    ["LIABILITY", "Contractor carries general liability insurance and workers compensation coverage as required by state law. Contractor is not liable for pre-existing conditions, concealed damage discovered during work, or damage caused by others. Contractor's total liability shall not exceed the total amount paid by Customer for services rendered."],
    ["CHANGE ORDERS", "Any changes to the scope of work must be documented in writing and signed by both parties before additional work begins. Additional work will be billed at the agreed hourly rate of $____/hour plus materials at cost plus 25% markup. Verbal change requests are not binding on either party."],
    ["CANCELLATION", "Either party may cancel this agreement with 48 hours written notice. Customer is responsible for payment of all work completed and materials purchased prior to cancellation. Deposits are non-refundable once work has commenced or materials have been ordered specifically for this project."],
    ["DISPUTE RESOLUTION", "Any disputes arising from this agreement will first be addressed through good-faith negotiation between both parties. If unresolved within 30 days, disputes will be submitted to binding arbitration in [County], [State]. The prevailing party is entitled to recover reasonable attorney fees and costs."],
    ["EMERGENCY RATES", "After-hours service (before 7:00 AM, after 6:00 PM, weekends, and holidays) is billed at 1.5x the standard hourly rate. Emergency/same-day dispatch includes an additional $75 surcharge. Customer will be informed of emergency pricing before work begins."],
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
      },
      children: [
        ...companyHeader(),

        new Paragraph({
          children: [
            new TextRun({ text: "PLUMBING SERVICE AGREEMENT", bold: true, size: 32, color: NAVY, font: "Arial" }),
          ],
          spacing: { after: 300 },
        }),

        bodyText("This agreement is entered into between:"),

        new Paragraph({ spacing: { after: 80 } }),
        fieldRow("Contractor", '[YOUR COMPANY NAME], License # [_______] ("Contractor")'),
        fieldRow("Customer", '[CUSTOMER NAME] ("Customer")'),
        fieldRow("Property Address", "[SERVICE ADDRESS]"),
        fieldRow("Effective Date", "[DATE]"),

        new Paragraph({ spacing: { after: 200 } }),

        ...clauses.flatMap(([title, text], i) => [
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}. ${title}`, bold: true, size: 22, color: NAVY, font: "Arial" }),
            ],
            spacing: { before: 250, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text, size: 21, font: "Arial", color: "333333" }),
            ],
            spacing: { after: 100 },
          }),
        ]),

        ...signatureBlock(),

        new Paragraph({
          children: [
            new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const path = join(OUTPUT_DIR, "plumbing-service-agreement.docx");
  await writeFile(path, buffer);
  return path;
}

// ============================================================
// 4. Warranty & Liability Protection Agreement
// ============================================================
async function createWarrantyAgreement(): Promise<string> {
  const clauses: [string, string][] = [
    ["LABOR WARRANTY", "All labor performed by Contractor is warranted for one (1) year from the date of completion. If any defect in workmanship appears during this period, Contractor will repair it at no additional charge, provided the defect is not caused by misuse, modification by others, or neglect. Customer must notify Contractor within 7 days of discovering a defect."],
    ["PARTS WARRANTY", "All parts and fixtures installed carry the manufacturer's warranty only. Contractor will assist Customer in filing warranty claims but is not responsible for manufacturer defects, recalls, or discontinuations. Customer should retain all receipts and warranty documentation provided at the time of installation."],
    ["WARRANTY EXCLUSIONS", "This warranty does not cover: (a) damage from frozen pipes if Customer fails to maintain adequate heat, (b) damage from chemical drain cleaners used by Customer, (c) unauthorized repairs or modifications by third parties, (d) acts of nature including floods, earthquakes, and ground shifting, (e) normal wear and tear, (f) cosmetic issues that do not affect function."],
    ["LIABILITY LIMITATION", "Contractor's total liability under this agreement shall not exceed the total amount paid by Customer for the services rendered. Contractor is not liable for consequential, incidental, or indirect damages including but not limited to: water damage to personal property, lost income, temporary housing costs, or emotional distress."],
    ["PRE-EXISTING CONDITIONS", "Contractor is not responsible for pre-existing plumbing deficiencies, code violations, or concealed conditions discovered during the course of work. If such conditions are found, Contractor will immediately notify Customer and provide a separate estimate for remediation. Work on pre-existing conditions requires separate written authorization."],
    ["INSURANCE", "Contractor maintains general liability insurance with minimum coverage of $1,000,000 per occurrence and workers compensation insurance as required by state law. Certificates of insurance are available upon request. Customer should verify coverage is current before work begins."],
    ["INDEMNIFICATION", "Customer agrees to indemnify and hold harmless Contractor, its employees, and subcontractors from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from Customer's misuse of the plumbing system, failure to follow maintenance recommendations provided in writing, or unauthorized modifications after service is complete."],
    ["GOVERNING LAW", "This agreement is governed by the laws of [State]. Both parties consent to exclusive jurisdiction in [County] for any legal proceedings related to this agreement. If any provision of this agreement is found unenforceable, the remaining provisions shall remain in full effect."],
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
      },
      children: [
        ...companyHeader(),

        new Paragraph({
          children: [
            new TextRun({ text: "WARRANTY & LIABILITY", bold: true, size: 32, color: NAVY, font: "Arial" }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "PROTECTION AGREEMENT", bold: true, size: 32, color: ORANGE, font: "Arial" }),
          ],
          spacing: { after: 300 },
        }),

        bodyText("This agreement is entered into between:"),

        new Paragraph({ spacing: { after: 80 } }),
        fieldRow("Contractor", '[YOUR COMPANY NAME], License # [_______] ("Contractor")'),
        fieldRow("Customer", '[CUSTOMER NAME] ("Customer")'),
        fieldRow("Property Address", "[SERVICE ADDRESS]"),
        fieldRow("Effective Date", "[DATE]"),

        new Paragraph({ spacing: { after: 200 } }),

        ...clauses.flatMap(([title, text], i) => [
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}. ${title}`, bold: true, size: 22, color: NAVY, font: "Arial" }),
            ],
            spacing: { before: 250, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text, size: 21, font: "Arial", color: "333333" }),
            ],
            spacing: { after: 100 },
          }),
        ]),

        ...signatureBlock(),

        new Paragraph({
          children: [
            new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const path = join(OUTPUT_DIR, "warranty-liability-agreement.docx");
  await writeFile(path, buffer);
  return path;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const { mkdirSync } = await import("fs");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("\nGenerating professional Word document templates...\n");

  const files = await Promise.all([
    createResidentialProposal(),
    createEmergencyProposal(),
    createServiceAgreement(),
    createWarrantyAgreement(),
  ]);

  console.log("Generated 4 Word documents.\n");

  // Mapping: slug -> new file path + new type
  const updates = [
    { slug: "free-residential-plumbing-proposal", file: files[0], filename: "residential-plumbing-proposal.docx" },
    { slug: "free-emergency-repair-proposal", file: files[1], filename: "emergency-repair-proposal.docx" },
    { slug: "free-plumbing-service-agreement", file: files[2], filename: "plumbing-service-agreement.docx" },
    { slug: "free-warranty-liability-agreement", file: files[3], filename: "warranty-liability-agreement.docx" },
  ];

  const blobToken = process.env.BLOB_DEV_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("No blob token found. Set BLOB_DEV_READ_WRITE_TOKEN");
    return;
  }

  for (const u of updates) {
    const blueprint = await prisma.blueprint.findUnique({ where: { slug: u.slug } });
    if (!blueprint) {
      console.error(`  Blueprint not found: ${u.slug}`);
      continue;
    }

    // Update type to "doc"
    await prisma.blueprint.update({
      where: { id: blueprint.id },
      data: { type: "doc" },
    });

    // Upload new file
    const fileBuffer = await readFile(u.file);
    const blob = await put(`blueprints/${blueprint.id}/${u.filename}`, fileBuffer, {
      access: "private",
      addRandomSuffix: true,
      token: blobToken,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Replace old file records
    await prisma.blueprintFile.deleteMany({ where: { blueprintId: blueprint.id } });
    await prisma.blueprintFile.create({
      data: {
        blueprintId: blueprint.id,
        filename: u.filename,
        blobUrl: blob.url,
        size: fileBuffer.length,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });

    console.log(`  ✓ ${u.slug} -> ${u.filename} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n✅ 4 templates upgraded from Excel to professional Word documents.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
