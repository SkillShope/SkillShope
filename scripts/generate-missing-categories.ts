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
import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();
const OUTPUT_DIR = join(process.cwd(), "scripts/artifacts");

const ORANGE = "FF6200";
const NAVY = "0A1628";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F5";

// ============================================================
// Shared Word doc helpers
// ============================================================
function companyHeader(): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: "[YOUR COMPANY NAME]", bold: true, size: 28, color: NAVY, font: "Arial" })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "[Phone] | [Email] | [License #]", size: 16, color: GRAY, font: "Arial" })],
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE } },
    }),
    new Paragraph({ spacing: { after: 120 } }),
  ];
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: ORANGE, font: "Arial" })],
    spacing: { before: 250, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" } },
  });
}

function bodyText(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 21, font: "Arial", color: "333333" })],
    spacing: { after: 120 },
  });
}

function checkItem(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: "☐  ", size: 22, font: "Arial", color: ORANGE }),
      new TextRun({ text, size: 20, font: "Arial", color: "333333" }),
    ],
    spacing: { after: 60 },
    indent: { left: 200 },
  });
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

function footer(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: "Generated with RoughInHub.com - Real Plumbing Blueprints from Real Plumbers", size: 16, color: GRAY, font: "Arial", italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
  });
}

function signatureBlock(): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 300 } }),
    new Paragraph({
      children: [new TextRun({ text: "SIGN-OFF", bold: true, size: 24, color: NAVY, font: "Arial" })],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Signature: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "________________________________________", size: 21, font: "Arial", color: GRAY }),
        new TextRun({ text: "    Date: ", bold: true, size: 21, font: "Arial" }),
        new TextRun({ text: "____________________", size: 21, font: "Arial", color: GRAY }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

// Excel helpers
function styleExcelHeader(row: ExcelJS.Row, color = "FF6200") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
  });
  row.height = 24;
}

// ============================================================
// 1. Training - Apprentice First Week Safety & Tool Orientation
// ============================================================
async function createTrainingChecklist(): Promise<{ path: string; filename: string; mime: string; type: string }> {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        ...companyHeader(),
        new Paragraph({
          children: [new TextRun({ text: "APPRENTICE FIRST WEEK", bold: true, size: 32, color: NAVY, font: "Arial" })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Safety & Tool Orientation Checklist", bold: true, size: 28, color: ORANGE, font: "Arial" })],
          spacing: { after: 200 },
        }),

        fieldRow("Apprentice Name", "________________________________________"),
        fieldRow("Start Date", "____________________"),
        fieldRow("Supervisor", "________________________________________"),

        new Paragraph({ spacing: { after: 150 } }),

        sectionHeading("DAY 1 - SAFETY ORIENTATION"),
        checkItem("Review company safety policy and sign acknowledgement"),
        checkItem("Locate first aid kit, fire extinguisher, and emergency exits on shop/truck"),
        checkItem("Issue and fit PPE: safety glasses, gloves, steel-toe boots requirement"),
        checkItem("Demonstrate proper lifting technique (pipe, water heaters, etc.)"),
        checkItem("Review lockout/tagout procedures for gas and water shutoffs"),
        checkItem("Explain confined space awareness (crawlspaces, trenches)"),
        checkItem("Review OSHA right-to-know: SDS sheets for solvents, flux, pipe dope"),

        sectionHeading("DAY 2 - TOOL IDENTIFICATION"),
        checkItem("Hand tools: pipe wrench, basin wrench, adjustable wrench, channel locks"),
        checkItem("Cutting tools: tubing cutter, hacksaw, PVC cutter, reciprocating saw"),
        checkItem("Soldering: torch, flux, solder, heat shield, fire cloth"),
        checkItem("Drain tools: hand auger, closet auger, plunger types"),
        checkItem("Measuring: tape measure, level, torpedo level"),
        checkItem("Power tools: drill, impact driver, right-angle drill (safe operation demo)"),
        checkItem("Demonstrate proper tool storage and truck organization"),

        sectionHeading("DAY 3 - MATERIALS IDENTIFICATION"),
        checkItem("Copper pipe types (K, L, M) and when to use each"),
        checkItem("PEX types (A, B) and connection methods (crimp, expansion, push-fit)"),
        checkItem("PVC vs ABS vs cast iron - drain/vent applications"),
        checkItem("Fitting types: couplings, elbows, tees, adapters, unions"),
        checkItem("Valve types: ball, gate, globe, check, pressure reducing"),
        checkItem("Sealants: teflon tape, pipe dope, thread sealant - when to use each"),

        sectionHeading("DAY 4-5 - SUPERVISED TASKS"),
        checkItem("Assist on a service call (observe and hand tools)"),
        checkItem("Cut and deburr copper pipe (supervised)"),
        checkItem("Make a solder joint (supervised, non-critical)"),
        checkItem("Assemble a PVC drain connection (supervised)"),
        checkItem("Install a shut-off valve (supervised)"),
        checkItem("Load and organize the service truck"),

        sectionHeading("WEEKLY REVIEW"),
        new Paragraph({
          children: [new TextRun({ text: "Supervisor Notes:", bold: true, size: 21, font: "Arial" })],
          spacing: { after: 80 },
        }),
        bodyText("_____________________________________________________________________________"),
        bodyText("_____________________________________________________________________________"),
        bodyText("_____________________________________________________________________________"),

        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "Apprentice ready for unsupervised basic tasks?   ", size: 21, font: "Arial" }),
            new TextRun({ text: "☐ Yes   ☐ No - needs more time on: ________________", size: 21, font: "Arial", color: ORANGE }),
          ],
          spacing: { after: 200 },
        }),

        ...signatureBlock(),
        footer(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = "apprentice-first-week-checklist.docx";
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, buffer);
  return { path, filename, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "doc" };
}

// ============================================================
// 2. Marketing - Google Review Request Scripts & Templates
// ============================================================
async function createMarketingKit(): Promise<{ path: string; filename: string; mime: string; type: string }> {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        ...companyHeader(),
        new Paragraph({
          children: [new TextRun({ text: "GOOGLE REVIEW REQUEST", bold: true, size: 32, color: NAVY, font: "Arial" })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Scripts & Templates Kit", bold: true, size: 28, color: ORANGE, font: "Arial" })],
          spacing: { after: 300 },
        }),

        bodyText("Google reviews are the #1 driver of new plumbing calls. Most happy customers will leave a review if you simply ask at the right time, in the right way. These scripts are tested and proven to get results."),

        new Paragraph({ spacing: { after: 100 } }),

        sectionHeading("SCRIPT 1: IN-PERSON (Right After the Job)"),
        bodyText("Use this while you're still at the customer's home, right after they've confirmed the work looks good:"),
        new Paragraph({ spacing: { after: 60 } }),
        new Paragraph({
          children: [new TextRun({ text: '"Hey [Name], glad we got that taken care of for you. If you have a minute, it would really help my business if you could leave a quick Google review. Most of my new customers find me through reviews, so it makes a big difference. I can text you the link right now if that\'s easier."', italics: true, size: 21, font: "Arial", color: "444444" })],
          spacing: { after: 120 },
          indent: { left: 400 },
        }),
        bodyText("Then text them your Google review link immediately. Don't wait - they'll forget by tomorrow."),

        sectionHeading("SCRIPT 2: TEXT MESSAGE (Same Day Follow-Up)"),
        bodyText("Send this 2-4 hours after completing the job:"),
        new Paragraph({ spacing: { after: 60 } }),
        new Paragraph({
          children: [new TextRun({ text: '"Hi [Name], this is [Your Name] from [Company]. Thanks again for choosing us today! If you have 30 seconds, a Google review would mean a lot to our small business. Here\'s the link: [YOUR GOOGLE REVIEW LINK]. Thanks!"', italics: true, size: 21, font: "Arial", color: "444444" })],
          spacing: { after: 120 },
          indent: { left: 400 },
        }),

        sectionHeading("SCRIPT 3: EMAIL (Next Day)"),
        bodyText("For customers who prefer email or didn't respond to the text:"),
        new Paragraph({ spacing: { after: 60 } }),
        new Paragraph({
          children: [new TextRun({ text: "Subject: Quick favor - 30 seconds?", bold: true, italics: true, size: 21, font: "Arial", color: "444444" })],
          spacing: { after: 60 },
          indent: { left: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '"Hi [Name],\n\nThanks for trusting [Company] with your plumbing work yesterday. I hope everything is working perfectly.\n\nIf you were happy with the service, I\'d really appreciate a quick Google review. It helps other homeowners find reliable plumbers in [City], and it only takes about 30 seconds:\n\n[YOUR GOOGLE REVIEW LINK]\n\nThanks again,\n[Your Name]\n[Company]\n[Phone]"', italics: true, size: 21, font: "Arial", color: "444444" })],
          spacing: { after: 120 },
          indent: { left: 400 },
        }),

        sectionHeading("SCRIPT 4: LEAVE-BEHIND CARD"),
        bodyText("Print this on a business card or small handout. Leave it with the invoice:"),
        new Paragraph({ spacing: { after: 60 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "Front: ", bold: true, size: 21, font: "Arial" }),
            new TextRun({ text: '"Thanks for choosing [Company]! Scan the QR code to leave a quick review."', italics: true, size: 21, font: "Arial", color: "444444" }),
          ],
          spacing: { after: 60 },
          indent: { left: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Back: ", bold: true, size: 21, font: "Arial" }),
            new TextRun({ text: "[QR code linking to your Google review page] + your logo and phone number", italics: true, size: 21, font: "Arial", color: "444444" }),
          ],
          spacing: { after: 120 },
          indent: { left: 400 },
        }),

        sectionHeading("HOW TO GET YOUR GOOGLE REVIEW LINK"),
        bodyText("1. Google your business name"),
        bodyText("2. Click your Google Business Profile listing"),
        bodyText('3. Click "Ask for reviews" button'),
        bodyText("4. Copy the link - this is what you text/email to customers"),
        bodyText("5. Save it in your phone notes for easy access"),

        sectionHeading("TIPS FOR MORE REVIEWS"),
        checkItem("Ask within 2 hours of finishing the job (while they're still grateful)"),
        checkItem("Make it easy - always text the direct link, don't make them search"),
        checkItem("Never offer incentives for reviews (violates Google policy)"),
        checkItem("Respond to every review - good or bad - within 24 hours"),
        checkItem("Goal: 1-2 new reviews per week = 50-100/year = dominant local presence"),

        new Paragraph({ spacing: { after: 100 } }),
        footer(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = "google-review-request-scripts.docx";
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, buffer);
  return { path, filename, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "doc" };
}

// ============================================================
// 3. Safety & Compliance - OSHA Jobsite Safety Checklist
// ============================================================
async function createSafetyChecklist(): Promise<{ path: string; filename: string; mime: string; type: string }> {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        ...companyHeader(),
        new Paragraph({
          children: [new TextRun({ text: "OSHA JOBSITE SAFETY CHECKLIST", bold: true, size: 32, color: NAVY, font: "Arial" })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "For Plumbing Contractors", bold: true, size: 28, color: ORANGE, font: "Arial" })],
          spacing: { after: 200 },
        }),

        fieldRow("Job Site", "________________________________________"),
        fieldRow("Date", "____________________"),
        fieldRow("Inspected by", "________________________________________"),

        new Paragraph({ spacing: { after: 150 } }),

        sectionHeading("PERSONAL PROTECTIVE EQUIPMENT (PPE)"),
        checkItem("Safety glasses / goggles available and worn"),
        checkItem("Work gloves appropriate for task (cut-resistant for copper, chemical-resistant for solvents)"),
        checkItem("Steel-toe or composite-toe boots worn by all workers"),
        checkItem("Hearing protection available near power tools / hammer drills"),
        checkItem("Respirator / dust mask available for soldering, cutting cast iron, or crawlspace work"),
        checkItem("Hard hat available if overhead hazards present"),

        sectionHeading("FIRE SAFETY"),
        checkItem("Fire extinguisher within 25 feet of soldering / torch work"),
        checkItem("Fire watch maintained for 30 minutes after torch work"),
        checkItem("Heat shield / fire cloth used when soldering near combustibles"),
        checkItem("Torch shut off and secured when not in active use"),
        checkItem("No flammable materials within 3 feet of torch work area"),

        sectionHeading("TRENCHING & EXCAVATION (if applicable)"),
        checkItem("Trench inspected before entry - no signs of collapse"),
        checkItem("Shoring, sloping, or trench box in place for trenches over 5 feet deep"),
        checkItem("Spoil pile at least 2 feet back from trench edge"),
        checkItem("Ladder within 25 feet of workers in trench over 4 feet deep"),
        checkItem("Utility locates completed before digging (811 called)"),

        sectionHeading("CONFINED SPACES"),
        checkItem("Crawlspace / confined space assessed before entry"),
        checkItem("Ventilation adequate (natural or forced air)"),
        checkItem("Gas detector used if sewer gas or natural gas risk"),
        checkItem("Second person aware of entry and monitoring"),
        checkItem("Communication method established"),

        sectionHeading("TOOL & EQUIPMENT SAFETY"),
        checkItem("Power tools inspected - cords undamaged, guards in place"),
        checkItem("GFCI protection on all power tools in wet locations"),
        checkItem("Drain machine cable in good condition - no kinks or fraying"),
        checkItem("Ladders inspected and rated for load (Type I or IA for commercial)"),
        checkItem("Pipe threading machine properly secured and guarded"),

        sectionHeading("HAZARD COMMUNICATION"),
        checkItem("SDS sheets accessible for all chemicals on site (flux, solvents, adhesives)"),
        checkItem("Chemical containers properly labeled"),
        checkItem("Workers trained on chemicals being used today"),
        checkItem("Proper ventilation when using PVC primer/cement or soldering flux"),

        sectionHeading("GENERAL SITE SAFETY"),
        checkItem("Work area clean and free of tripping hazards"),
        checkItem("Adequate lighting in work area"),
        checkItem("First aid kit stocked and accessible"),
        checkItem("Emergency contact numbers posted / accessible"),
        checkItem("Water shut-off location identified and accessible"),
        checkItem("Gas shut-off location identified and accessible"),

        new Paragraph({ spacing: { after: 200 } }),

        new Paragraph({
          children: [new TextRun({ text: "Issues Found / Corrective Actions Taken:", bold: true, size: 21, font: "Arial" })],
          spacing: { after: 80 },
        }),
        bodyText("_____________________________________________________________________________"),
        bodyText("_____________________________________________________________________________"),
        bodyText("_____________________________________________________________________________"),

        ...signatureBlock(),
        footer(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = "osha-jobsite-safety-checklist.docx";
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, buffer);
  return { path, filename, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "doc" };
}

// ============================================================
// 4. Residential - Whole-House Plumbing Inspection Checklist
// ============================================================
async function createResidentialInspection(): Promise<{ path: string; filename: string; mime: string; type: string }> {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      children: [
        ...companyHeader(),
        new Paragraph({
          children: [new TextRun({ text: "WHOLE-HOUSE PLUMBING", bold: true, size: 32, color: NAVY, font: "Arial" })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "INSPECTION CHECKLIST", bold: true, size: 28, color: ORANGE, font: "Arial" })],
          spacing: { after: 200 },
        }),

        fieldRow("Homeowner", "________________________________________"),
        fieldRow("Property Address", "________________________________________"),
        fieldRow("Date", "____________________"),
        fieldRow("Inspector", "________________________________________"),
        fieldRow("Property Age (approx)", "____________________"),

        new Paragraph({ spacing: { after: 150 } }),

        sectionHeading("WATER SUPPLY SYSTEM"),
        checkItem("Main shut-off valve accessible and operational"),
        checkItem("Pressure reducing valve present and functional (if needed)"),
        checkItem("Water pressure test: ______ PSI (ideal 40-80 PSI)"),
        checkItem("Supply pipe material identified: Copper / PEX / CPVC / Galvanized / Poly"),
        checkItem("No visible corrosion, staining, or mineral buildup on supply pipes"),
        checkItem("No active leaks at any visible connections"),
        checkItem("Shut-off valves at each fixture operational"),
        checkItem("Expansion tank present and properly charged (if closed system)"),

        sectionHeading("DRAIN / WASTE / VENT SYSTEM"),
        checkItem("All drains flowing freely (kitchen, bath, laundry)"),
        checkItem("No slow drains or gurgling sounds"),
        checkItem("Vent pipes visible through roof - no blockage or damage"),
        checkItem("P-traps present and holding water at all fixtures"),
        checkItem("Cleanout access points accessible and capped"),
        checkItem("No sewer odor detected inside the home"),
        checkItem("Drain pipe material: ABS / PVC / Cast Iron / Orangeburg"),
        checkItem("Sump pump operational (if present) - test by adding water"),

        sectionHeading("WATER HEATER"),
        checkItem("Unit age: ______ years (typical life 8-12 for tank, 15-20 for tankless)"),
        checkItem("No rust or corrosion on tank or connections"),
        checkItem("T&P relief valve present and has discharge pipe"),
        checkItem("No water stains or evidence of past leaks around base"),
        checkItem("Proper venting (gas units) - no disconnection or corrosion"),
        checkItem("Thermostat set at safe temperature (120F recommended)"),

        sectionHeading("FIXTURES & APPLIANCES"),
        checkItem("All toilets flush properly and don't run continuously"),
        checkItem("No rocking or movement at toilet base"),
        checkItem("All faucets operate smoothly - no drips when off"),
        checkItem("No leaks under any sinks"),
        checkItem("Dishwasher connection - no leaks, air gap or high loop present"),
        checkItem("Washing machine hoses in good condition (replace if rubber/bulging)"),
        checkItem("Garbage disposal operational (if present)"),
        checkItem("Outdoor hose bibs - no dripping, anti-siphon device present"),

        sectionHeading("VISIBLE PIPE CONDITION"),
        checkItem("No signs of water damage on walls, ceilings, or floors"),
        checkItem("Crawlspace / basement pipes insulated where exposed to cold"),
        checkItem("No galvanized pipe remaining (common in pre-1970 homes)"),
        checkItem("No polybutylene (gray) pipe remaining (recall/failure risk)"),
        checkItem("Pipe hangers and supports in good condition"),

        new Paragraph({ spacing: { after: 200 } }),

        sectionHeading("SUMMARY & RECOMMENDATIONS"),
        new Paragraph({
          children: [
            new TextRun({ text: "Overall Condition:   ", bold: true, size: 21, font: "Arial" }),
            new TextRun({ text: "☐ Good   ☐ Fair   ☐ Needs Attention   ☐ Urgent Repairs Needed", size: 21, font: "Arial", color: ORANGE }),
          ],
          spacing: { after: 150 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Recommended Repairs / Upgrades:", bold: true, size: 21, font: "Arial" })],
          spacing: { after: 80 },
        }),
        bodyText("1. ___________________________________________________________________________"),
        bodyText("2. ___________________________________________________________________________"),
        bodyText("3. ___________________________________________________________________________"),
        bodyText("4. ___________________________________________________________________________"),

        ...signatureBlock(),
        footer(),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = "whole-house-plumbing-inspection.docx";
  const path = join(OUTPUT_DIR, filename);
  await writeFile(path, buffer);
  return { path, filename, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type: "doc" };
}

// ============================================================
// 5. Commercial - Commercial Restroom Rough-In Bid Calculator
// ============================================================
async function createCommercialBidCalc(): Promise<{ path: string; filename: string; mime: string; type: string }> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet("Commercial Restroom Bid");

  ws.columns = [
    { header: "Line Item", key: "item", width: 40 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Unit", key: "unit", width: 10 },
    { header: "Material $/Unit", key: "matCost", width: 16 },
    { header: "Material Total", key: "matTotal", width: 16 },
    { header: "Labor Hours", key: "laborHrs", width: 14 },
    { header: "Labor Rate", key: "laborRate", width: 12 },
    { header: "Labor Total", key: "laborTotal", width: 14 },
    { header: "Line Total", key: "lineTotal", width: 14 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ORANGE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  });
  headerRow.height = 24;

  const items: [string, number, string, number, number, number][] = [
    ["Flush valve toilet (floor mount, ADA)", 4, "ea", 85, 2.5, 95],
    ["Flush valve urinal (wall mount)", 2, "ea", 65, 2.0, 95],
    ["Commercial lavatory (wall mount, ADA)", 3, "ea", 120, 2.0, 95],
    ["Floor drain (4\" with trap primer connection)", 2, "ea", 45, 1.5, 95],
    ["Copper supply (3/4\" Type L, 10ft)", 8, "ea", 22, 0.75, 95],
    ["Copper supply (1\" Type L, 10ft)", 4, "ea", 35, 1.0, 95],
    ["Cast iron drain (4\" x 10ft)", 6, "ea", 28, 1.0, 95],
    ["Cast iron drain (2\" x 10ft)", 4, "ea", 18, 0.75, 95],
    ["Vent pipe PVC (2\" x 10ft)", 6, "ea", 8, 0.5, 95],
    ["Backflow preventer (3/4\")", 1, "ea", 180, 2.0, 95],
    ["Trap primers (electronic)", 2, "ea", 95, 1.5, 95],
    ["Shut-off valves (commercial grade)", 9, "ea", 25, 0.5, 95],
    ["ADA grab bar backing (in-wall)", 4, "ea", 15, 0.5, 95],
    ["Pipe insulation (6ft sections)", 20, "ea", 6, 0.25, 95],
    ["Hangers, fittings, sealant (misc)", 1, "lot", 350, 2.0, 95],
    ["Permit fee (commercial)", 1, "ea", 300, 0, 0],
    ["Inspection coordination (2 visits)", 1, "ea", 0, 3.0, 95],
  ];

  items.forEach((item, i) => {
    const r = i + 2;
    ws.getCell(`A${r}`).value = item[0];
    ws.getCell(`B${r}`).value = item[1];
    ws.getCell(`C${r}`).value = item[2];
    ws.getCell(`D${r}`).value = item[3];
    ws.getCell(`E${r}`).value = { formula: `B${r}*D${r}` };
    ws.getCell(`F${r}`).value = item[4];
    ws.getCell(`G${r}`).value = item[5];
    ws.getCell(`H${r}`).value = { formula: `F${r}*G${r}` };
    ws.getCell(`I${r}`).value = { formula: `E${r}+H${r}` };
    ["D", "E", "G", "H", "I"].forEach((col) => {
      ws.getCell(`${col}${r}`).numFmt = '"$"#,##0.00';
    });
  });

  const last = items.length + 1;
  const s = last + 2;

  ws.getCell(`A${s}`).value = "SUBTOTAL (Materials)";
  ws.getCell(`A${s}`).font = { bold: true };
  ws.getCell(`E${s}`).value = { formula: `SUM(E2:E${last})` };
  ws.getCell(`E${s}`).numFmt = '"$"#,##0.00';
  ws.getCell(`E${s}`).font = { bold: true };

  ws.getCell(`A${s + 1}`).value = "SUBTOTAL (Labor)";
  ws.getCell(`A${s + 1}`).font = { bold: true };
  ws.getCell(`H${s + 1}`).value = { formula: `SUM(H2:H${last})` };
  ws.getCell(`H${s + 1}`).numFmt = '"$"#,##0.00';
  ws.getCell(`H${s + 1}`).font = { bold: true };

  ws.getCell(`A${s + 2}`).value = "SUBTOTAL (Combined)";
  ws.getCell(`A${s + 2}`).font = { bold: true };
  ws.getCell(`I${s + 2}`).value = { formula: `SUM(I2:I${last})` };
  ws.getCell(`I${s + 2}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${s + 2}`).font = { bold: true };

  ws.getCell(`A${s + 4}`).value = "Markup %";
  ws.getCell(`B${s + 4}`).value = 0.30;
  ws.getCell(`B${s + 4}`).numFmt = "0%";

  ws.getCell(`A${s + 5}`).value = "Markup Amount";
  ws.getCell(`I${s + 5}`).value = { formula: `I${s + 2}*B${s + 4}` };
  ws.getCell(`I${s + 5}`).numFmt = '"$"#,##0.00';

  ws.getCell(`A${s + 6}`).value = "TOTAL BID PRICE";
  ws.getCell(`A${s + 6}`).font = { bold: true, size: 13, color: { argb: ORANGE } };
  ws.getCell(`I${s + 6}`).value = { formula: `I${s + 2}+I${s + 5}` };
  ws.getCell(`I${s + 6}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${s + 6}`).font = { bold: true, size: 13, color: { argb: ORANGE } };

  ws.getCell(`A${s + 8}`).value = "YOUR PROFIT";
  ws.getCell(`A${s + 8}`).font = { bold: true, color: { argb: "22C55E" } };
  ws.getCell(`I${s + 8}`).value = { formula: `I${s + 5}` };
  ws.getCell(`I${s + 8}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${s + 8}`).font = { bold: true, color: { argb: "22C55E" } };

  ws.getCell(`A${s + 10}`).value = "NOTES:";
  ws.getCell(`A${s + 10}`).font = { bold: true };
  ws.getCell(`A${s + 11}`).value = "- Commercial rates: adjust column G for your market";
  ws.getCell(`A${s + 12}`).value = "- ADA compliance: verify all fixture heights and clearances with local code";
  ws.getCell(`A${s + 13}`).value = "- Prevailing wage jobs: increase labor rate accordingly";
  ws.getCell(`A${s + 14}`).value = "- Markup: 30% is standard for commercial; adjust in cell B" + (s + 4);

  const filename = "commercial-restroom-bid-calculator.xlsx";
  const path = join(OUTPUT_DIR, filename);
  await wb.xlsx.writeFile(path);
  return { path, filename, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", type: "excel" };
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("\nGenerating 5 artifacts for missing categories...\n");

  const admin = await prisma.user.upsert({
    where: { email: "admin@roughinhub.com" },
    update: {},
    create: { email: "admin@roughinhub.com", name: "RoughInHub", isAdmin: true },
  });

  const artifacts = [
    {
      gen: createTrainingChecklist,
      slug: "free-apprentice-first-week-checklist",
      name: "Free Apprentice First Week Safety & Tool Orientation Checklist",
      description: "5-day structured orientation checklist for new plumbing apprentices. Covers safety training, tool identification, materials knowledge, and supervised tasks with supervisor sign-off.",
      longDescription: "Training a new apprentice without a plan wastes time and money. This checklist gives you a structured 5-day orientation covering everything a first-week apprentice needs: safety protocols, tool identification, material types, and supervised hands-on tasks.\n\nIncludes supervisor notes section and a readiness assessment to decide if the apprentice is ready for basic unsupervised work. Print it out and check off items as you go through the week.",
      category: "training",
      region: "Nationwide",
      tags: "apprentice,training,safety,orientation,new hire,free",
    },
    {
      gen: createMarketingKit,
      slug: "free-google-review-request-scripts",
      name: "Free Google Review Request Scripts & Templates",
      description: "4 proven scripts for getting Google reviews: in-person, text message, email, and leave-behind card template. Most plumbers' new calls come from reviews. Start getting more today.",
      longDescription: "Google reviews are the single most effective way to get new plumbing calls without spending money on ads. The problem is most plumbers don't ask, or they ask the wrong way.\n\nThis kit includes 4 tested scripts: an in-person ask (right after the job), a same-day text follow-up, a next-day email, and a leave-behind card template. Plus tips on timing, frequency, and how to respond to reviews. Goal: 1-2 new reviews per week.",
      category: "marketing",
      region: "Nationwide",
      tags: "marketing,google reviews,scripts,templates,free",
    },
    {
      gen: createSafetyChecklist,
      slug: "free-osha-jobsite-safety-checklist",
      name: "Free OSHA Jobsite Safety Checklist for Plumbers",
      description: "Comprehensive safety inspection checklist covering PPE, fire safety, trenching, confined spaces, tool safety, and hazard communication. Keeps you OSHA-compliant and protects your crew.",
      longDescription: "One OSHA violation can cost you thousands. This checklist covers every safety category relevant to plumbing work: PPE requirements, fire safety around torch work, trenching and excavation rules, confined space protocols, tool and equipment inspection, and chemical hazard communication.\n\nUse it before starting work at each new jobsite. Includes a corrective actions section and sign-off. Keeps your crew safe and gives you documentation if OSHA ever shows up.",
      category: "safety-compliance",
      region: "Nationwide",
      tags: "OSHA,safety,compliance,inspection,jobsite,free",
    },
    {
      gen: createResidentialInspection,
      slug: "free-whole-house-plumbing-inspection",
      name: "Free Whole-House Plumbing Inspection Checklist",
      description: "Complete residential plumbing inspection covering supply system, drains/vents, water heater, fixtures, and visible pipe condition. Perfect for home buyer inspections and annual maintenance checks.",
      longDescription: "Whether you're doing a pre-purchase inspection or an annual maintenance check, this checklist ensures you don't miss anything. Covers all five major residential plumbing systems: water supply, drain/waste/vent, water heater, fixtures and appliances, and visible pipe condition.\n\nIncludes a summary section with overall condition rating and space for 4 recommended repairs. Professional format with your company branding at the top. Great for upselling additional work from inspection findings.",
      category: "residential",
      region: "Nationwide",
      tags: "inspection,residential,whole house,maintenance,home buyer,free",
    },
    {
      gen: createCommercialBidCalc,
      slug: "free-commercial-restroom-bid-calculator",
      name: "Free Commercial Restroom Rough-In Bid Calculator",
      description: "Excel bid calculator for commercial restroom rough-ins with ADA fixtures, cast iron drains, backflow prevention, and trap primers. 30% markup default for commercial work. Formulas built in.",
      longDescription: "Commercial restroom rough-ins are complex and easy to underbid. This calculator includes 17 common line items specific to commercial work: flush valve toilets, wall-mount urinals, ADA lavatories, cast iron drainage, backflow preventers, trap primers, and more.\n\nAll formulas are built in. Just update quantities and your local rates. Default 30% markup for commercial work (adjustable). Includes notes on ADA compliance, prevailing wage considerations, and inspection coordination.",
      category: "commercial",
      region: "Nationwide",
      tags: "commercial,restroom,bid calculator,ADA,rough-in,free",
    },
  ];

  const blobToken = process.env.BLOB_DEV_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("No blob token found.");
    return;
  }

  for (const a of artifacts) {
    const file = await a.gen();

    const blueprint = await prisma.blueprint.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name, description: a.description, longDescription: a.longDescription,
        category: a.category, type: file.type, region: a.region, tags: a.tags,
        isFree: true, price: 0, featured: false, hidden: false, contentAcknowledgedAt: new Date(),
      },
      create: {
        slug: a.slug, name: a.name, description: a.description, longDescription: a.longDescription,
        category: a.category, type: file.type, region: a.region, tags: a.tags,
        isFree: true, price: 0, featured: false, hidden: false, contentAcknowledgedAt: new Date(),
        authorId: admin.id,
      },
    });

    const fileBuffer = await readFile(file.path);
    const blob = await put(`blueprints/${blueprint.id}/${file.filename}`, fileBuffer, {
      access: "private", addRandomSuffix: true, token: blobToken, contentType: file.mime,
    });

    await prisma.blueprintFile.deleteMany({ where: { blueprintId: blueprint.id } });
    await prisma.blueprintFile.create({
      data: {
        blueprintId: blueprint.id, filename: file.filename,
        blobUrl: blob.url, size: fileBuffer.length, mimeType: file.mime,
      },
    });

    console.log(`  ✓ [${a.category}] ${a.name} (${file.filename}, ${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n✅ 5 artifacts created for missing categories.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
