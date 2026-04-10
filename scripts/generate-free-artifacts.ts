import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { readFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();
const OUTPUT_DIR = join(process.cwd(), "scripts/artifacts");

// Helper to style header rows
function styleHeader(row: ExcelJS.Row, color = "FF6200") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
  row.height = 24;
}

function styleCells(sheet: ExcelJS.Worksheet, startRow: number, endRow: number) {
  for (let r = startRow; r <= endRow; r++) {
    const row = sheet.getRow(r);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "D0D0D0" } },
        bottom: { style: "thin", color: { argb: "D0D0D0" } },
        left: { style: "thin", color: { argb: "D0D0D0" } },
        right: { style: "thin", color: { argb: "D0D0D0" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  }
}

// ============================================================
// 1. Residential Bathroom Remodel Bid Calculator
// ============================================================
async function createBathroomBidCalc() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";

  const ws = wb.addWorksheet("Bathroom Remodel Bid");

  ws.columns = [
    { header: "Line Item", key: "item", width: 35 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Unit", key: "unit", width: 10 },
    { header: "Material $/Unit", key: "matCost", width: 16 },
    { header: "Material Total", key: "matTotal", width: 16 },
    { header: "Labor Hours", key: "laborHrs", width: 14 },
    { header: "Labor Rate", key: "laborRate", width: 12 },
    { header: "Labor Total", key: "laborTotal", width: 14 },
    { header: "Line Total", key: "lineTotal", width: 14 },
  ];

  styleHeader(ws.getRow(1));

  const items = [
    ["Rough-in copper supply lines (1/2\")", 4, "ea", 18.50, 1.5, 75],
    ["PEX supply lines (3/4\" x 10ft)", 2, "ea", 12.00, 0.75, 75],
    ["ABS drain pipe (2\" x 10ft)", 3, "ea", 8.50, 1.0, 75],
    ["PVC vent pipe (1.5\" x 10ft)", 2, "ea", 6.75, 0.5, 75],
    ["Toilet flange + wax ring", 1, "ea", 15.00, 0.5, 75],
    ["Shower valve (pressure balance)", 1, "ea", 85.00, 2.0, 75],
    ["Tub/shower drain assembly", 1, "ea", 35.00, 1.0, 75],
    ["Lavatory drain + P-trap", 1, "ea", 22.00, 0.75, 75],
    ["Shut-off valves (1/4 turn)", 4, "ea", 12.00, 0.5, 75],
    ["Pipe hangers + fittings (misc)", 1, "lot", 45.00, 0.5, 75],
    ["Permit fee", 1, "ea", 150.00, 0, 0],
    ["Dumpster / debris removal", 1, "ea", 200.00, 0, 0],
  ];

  items.forEach((item, i) => {
    const row = i + 2;
    ws.getCell(`A${row}`).value = item[0];
    ws.getCell(`B${row}`).value = item[1];
    ws.getCell(`C${row}`).value = item[2];
    ws.getCell(`D${row}`).value = item[3];
    ws.getCell(`E${row}`).value = { formula: `B${row}*D${row}` };
    ws.getCell(`F${row}`).value = item[4];
    ws.getCell(`G${row}`).value = item[5];
    ws.getCell(`H${row}`).value = { formula: `F${row}*G${row}` };
    ws.getCell(`I${row}`).value = { formula: `E${row}+H${row}` };

    // Currency formatting
    ["D", "E", "G", "H", "I"].forEach((col) => {
      ws.getCell(`${col}${row}`).numFmt = '"$"#,##0.00';
    });
  });

  const lastItem = items.length + 1;
  const summaryStart = lastItem + 2;

  styleCells(ws, 2, lastItem);

  // Summary section
  ws.getCell(`A${summaryStart}`).value = "SUBTOTAL (Materials)";
  ws.getCell(`A${summaryStart}`).font = { bold: true };
  ws.getCell(`E${summaryStart}`).value = { formula: `SUM(E2:E${lastItem})` };
  ws.getCell(`E${summaryStart}`).numFmt = '"$"#,##0.00';
  ws.getCell(`E${summaryStart}`).font = { bold: true };

  ws.getCell(`A${summaryStart + 1}`).value = "SUBTOTAL (Labor)";
  ws.getCell(`A${summaryStart + 1}`).font = { bold: true };
  ws.getCell(`H${summaryStart + 1}`).value = { formula: `SUM(H2:H${lastItem})` };
  ws.getCell(`H${summaryStart + 1}`).numFmt = '"$"#,##0.00';
  ws.getCell(`H${summaryStart + 1}`).font = { bold: true };

  ws.getCell(`A${summaryStart + 2}`).value = "SUBTOTAL (Combined)";
  ws.getCell(`A${summaryStart + 2}`).font = { bold: true };
  ws.getCell(`I${summaryStart + 2}`).value = { formula: `SUM(I2:I${lastItem})` };
  ws.getCell(`I${summaryStart + 2}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${summaryStart + 2}`).font = { bold: true };

  ws.getCell(`A${summaryStart + 4}`).value = "Markup %";
  ws.getCell(`B${summaryStart + 4}`).value = 0.25;
  ws.getCell(`B${summaryStart + 4}`).numFmt = "0%";

  ws.getCell(`A${summaryStart + 5}`).value = "Markup Amount";
  ws.getCell(`I${summaryStart + 5}`).value = { formula: `I${summaryStart + 2}*B${summaryStart + 4}` };
  ws.getCell(`I${summaryStart + 5}`).numFmt = '"$"#,##0.00';

  ws.getCell(`A${summaryStart + 6}`).value = "TOTAL BID PRICE";
  ws.getCell(`A${summaryStart + 6}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };
  ws.getCell(`I${summaryStart + 6}`).value = { formula: `I${summaryStart + 2}+I${summaryStart + 5}` };
  ws.getCell(`I${summaryStart + 6}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${summaryStart + 6}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };

  ws.getCell(`A${summaryStart + 8}`).value = "YOUR PROFIT";
  ws.getCell(`A${summaryStart + 8}`).font = { bold: true, color: { argb: "22C55E" } };
  ws.getCell(`I${summaryStart + 8}`).value = { formula: `I${summaryStart + 5}` };
  ws.getCell(`I${summaryStart + 8}`).numFmt = '"$"#,##0.00';
  ws.getCell(`I${summaryStart + 8}`).font = { bold: true, color: { argb: "22C55E" } };

  const path = join(OUTPUT_DIR, "bathroom-remodel-bid-calculator.xlsx");
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// 2. Water Heater Replacement Estimate Calculator
// ============================================================
async function createWaterHeaterCalc() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet("Water Heater Estimate");

  ws.columns = [
    { header: "Item", key: "item", width: 40 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Cost Each", key: "cost", width: 14 },
    { header: "Total", key: "total", width: 14 },
  ];
  styleHeader(ws.getRow(1));

  const items = [
    ["Standard 50-gal gas water heater", 1, 650],
    ["Expansion tank", 1, 45],
    ["Water flex connectors (pair)", 1, 25],
    ["Gas flex connector", 1, 30],
    ["T&P relief valve", 1, 18],
    ["Discharge pipe (copper)", 1, 12],
    ["Pipe dope + teflon tape", 1, 8],
    ["Permit fee", 1, 75],
    ["Old unit haul-away / disposal", 1, 50],
    ["Labor - removal of old unit", 1, 150],
    ["Labor - install new unit", 1, 250],
    ["Labor - gas line work", 1, 100],
  ];

  items.forEach((item, i) => {
    const r = i + 2;
    ws.getCell(`A${r}`).value = item[0];
    ws.getCell(`B${r}`).value = item[1];
    ws.getCell(`C${r}`).value = item[2];
    ws.getCell(`C${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`D${r}`).value = { formula: `B${r}*C${r}` };
    ws.getCell(`D${r}`).numFmt = '"$"#,##0.00';
  });

  const last = items.length + 1;
  styleCells(ws, 2, last);

  ws.getCell(`A${last + 2}`).value = "SUBTOTAL";
  ws.getCell(`A${last + 2}`).font = { bold: true };
  ws.getCell(`D${last + 2}`).value = { formula: `SUM(D2:D${last})` };
  ws.getCell(`D${last + 2}`).numFmt = '"$"#,##0.00';
  ws.getCell(`D${last + 2}`).font = { bold: true };

  ws.getCell(`A${last + 3}`).value = "Markup (25%)";
  ws.getCell(`D${last + 3}`).value = { formula: `D${last + 2}*0.25` };
  ws.getCell(`D${last + 3}`).numFmt = '"$"#,##0.00';

  ws.getCell(`A${last + 4}`).value = "TOTAL ESTIMATE";
  ws.getCell(`A${last + 4}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };
  ws.getCell(`D${last + 4}`).value = { formula: `D${last + 2}+D${last + 3}` };
  ws.getCell(`D${last + 4}`).numFmt = '"$"#,##0.00';
  ws.getCell(`D${last + 4}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };

  // Tankless upgrade option on second sheet
  const ws2 = wb.addWorksheet("Tankless Upgrade Option");
  ws2.columns = [
    { header: "Item", key: "item", width: 40 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Cost Each", key: "cost", width: 14 },
    { header: "Total", key: "total", width: 14 },
  ];
  styleHeader(ws2.getRow(1));

  const tanklessItems = [
    ["Tankless gas water heater (Rinnai/Navien)", 1, 1200],
    ["Venting kit (stainless steel)", 1, 180],
    ["Gas line upgrade (3/4\" to 1\")", 1, 250],
    ["Condensate drain line", 1, 35],
    ["Isolation valves", 2, 20],
    ["Mounting bracket + hardware", 1, 45],
    ["Electrical outlet (GFCI)", 1, 85],
    ["Permit fee", 1, 100],
    ["Old unit haul-away", 1, 50],
    ["Labor - full install", 1, 600],
  ];

  tanklessItems.forEach((item, i) => {
    const r = i + 2;
    ws2.getCell(`A${r}`).value = item[0];
    ws2.getCell(`B${r}`).value = item[1];
    ws2.getCell(`C${r}`).value = item[2];
    ws2.getCell(`C${r}`).numFmt = '"$"#,##0.00';
    ws2.getCell(`D${r}`).value = { formula: `B${r}*C${r}` };
    ws2.getCell(`D${r}`).numFmt = '"$"#,##0.00';
  });

  const last2 = tanklessItems.length + 1;
  styleCells(ws2, 2, last2);

  ws2.getCell(`A${last2 + 2}`).value = "SUBTOTAL";
  ws2.getCell(`A${last2 + 2}`).font = { bold: true };
  ws2.getCell(`D${last2 + 2}`).value = { formula: `SUM(D2:D${last2})` };
  ws2.getCell(`D${last2 + 2}`).numFmt = '"$"#,##0.00';
  ws2.getCell(`D${last2 + 2}`).font = { bold: true };

  ws2.getCell(`A${last2 + 3}`).value = "Markup (30%)";
  ws2.getCell(`D${last2 + 3}`).value = { formula: `D${last2 + 2}*0.30` };
  ws2.getCell(`D${last2 + 3}`).numFmt = '"$"#,##0.00';

  ws2.getCell(`A${last2 + 4}`).value = "TOTAL ESTIMATE";
  ws2.getCell(`A${last2 + 4}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };
  ws2.getCell(`D${last2 + 4}`).value = { formula: `D${last2 + 2}+D${last2 + 3}` };
  ws2.getCell(`D${last2 + 4}`).numFmt = '"$"#,##0.00';
  ws2.getCell(`D${last2 + 4}`).font = { bold: true, size: 13, color: { argb: "FF6200" } };

  const path = join(OUTPUT_DIR, "water-heater-replacement-calculator.xlsx");
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// 3. General Service Call Pricing Sheet
// ============================================================
async function createServiceCallPricing() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet("Service Call Pricing");

  ws.columns = [
    { header: "Service Type", key: "type", width: 35 },
    { header: "Base Fee", key: "base", width: 14 },
    { header: "Hourly Rate", key: "hourly", width: 14 },
    { header: "Est. Hours", key: "hours", width: 12 },
    { header: "Est. Materials", key: "mats", width: 16 },
    { header: "Quote Price", key: "quote", width: 14 },
  ];
  styleHeader(ws.getRow(1));

  const services = [
    ["Diagnostic / trip charge", 85, 0, 0, 0],
    ["Faucet repair (single handle)", 85, 95, 1, 25],
    ["Faucet replacement", 85, 95, 1.5, 120],
    ["Toilet repair (flapper/fill valve)", 85, 95, 0.75, 20],
    ["Toilet replacement", 85, 95, 2, 250],
    ["Garbage disposal replacement", 85, 95, 1.5, 180],
    ["Drain cleaning (main line)", 85, 95, 1.5, 0],
    ["Drain cleaning (secondary)", 85, 95, 1, 0],
    ["Water heater flush", 85, 95, 1, 15],
    ["Pipe leak repair (accessible)", 85, 95, 1.5, 30],
    ["Pipe leak repair (in-wall)", 85, 95, 3, 60],
    ["Sump pump replacement", 85, 95, 2, 280],
    ["Shut-off valve replacement", 85, 95, 1, 25],
    ["Hose bib replacement", 85, 95, 1, 35],
    ["Water pressure regulator", 85, 95, 1.5, 65],
  ];

  services.forEach((s, i) => {
    const r = i + 2;
    ws.getCell(`A${r}`).value = s[0];
    ws.getCell(`B${r}`).value = s[1];
    ws.getCell(`B${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`C${r}`).value = s[2];
    ws.getCell(`C${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`D${r}`).value = s[3];
    ws.getCell(`E${r}`).value = s[4];
    ws.getCell(`E${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`F${r}`).value = { formula: `B${r}+(C${r}*D${r})+E${r}` };
    ws.getCell(`F${r}`).numFmt = '"$"#,##0.00';
    ws.getCell(`F${r}`).font = { bold: true };
  });

  styleCells(ws, 2, services.length + 1);

  // Notes
  const noteRow = services.length + 3;
  ws.getCell(`A${noteRow}`).value = "NOTES:";
  ws.getCell(`A${noteRow}`).font = { bold: true };
  ws.getCell(`A${noteRow + 1}`).value = "- Base fee includes first 30 minutes on-site";
  ws.getCell(`A${noteRow + 2}`).value = "- After-hours / weekend: add 50% to labor rate";
  ws.getCell(`A${noteRow + 3}`).value = "- Emergency / same-day: add $50 surcharge";
  ws.getCell(`A${noteRow + 4}`).value = "- Customize rates in columns B and C to match your market";

  const path = join(OUTPUT_DIR, "service-call-pricing-sheet.xlsx");
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// 4-6. Service Checklists
// ============================================================
async function createChecklist(
  title: string,
  sheetName: string,
  filename: string,
  steps: string[],
  equipment: string[]
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet(sheetName);

  ws.columns = [
    { header: "#", key: "num", width: 5 },
    { header: "Step", key: "step", width: 50 },
    { header: "Pass", key: "pass", width: 8 },
    { header: "Fail", key: "fail", width: 8 },
    { header: "N/A", key: "na", width: 8 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  // Title row
  ws.insertRow(1, [title]);
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "0A1628" } };
  ws.mergeCells("A1:F1");

  // Job info
  ws.insertRow(2, []);
  ws.getCell("A3").value = "Customer:";
  ws.getCell("A3").font = { bold: true };
  ws.getCell("B3").value = "________________________________";
  ws.getCell("D3").value = "Date:";
  ws.getCell("D3").font = { bold: true };
  ws.getCell("E3").value = "_______________";

  ws.getCell("A4").value = "Address:";
  ws.getCell("A4").font = { bold: true };
  ws.getCell("B4").value = "________________________________";
  ws.getCell("D4").value = "Tech:";
  ws.getCell("D4").font = { bold: true };
  ws.getCell("E4").value = "_______________";

  // Equipment section
  ws.getCell("A6").value = "EQUIPMENT NEEDED";
  ws.getCell("A6").font = { bold: true, size: 11 };
  equipment.forEach((eq, i) => {
    ws.getCell(`A${7 + i}`).value = `[ ]  ${eq}`;
  });

  // Checklist header
  const headerRow = 7 + equipment.length + 1;
  ws.getRow(headerRow).values = ["#", "Step", "Pass", "Fail", "N/A", "Notes"];
  styleHeader(ws.getRow(headerRow));

  // Steps
  steps.forEach((step, i) => {
    const r = headerRow + 1 + i;
    ws.getCell(`A${r}`).value = i + 1;
    ws.getCell(`A${r}`).alignment = { horizontal: "center" };
    ws.getCell(`B${r}`).value = step;
    ws.getCell(`C${r}`).value = "[ ]";
    ws.getCell(`C${r}`).alignment = { horizontal: "center" };
    ws.getCell(`D${r}`).value = "[ ]";
    ws.getCell(`D${r}`).alignment = { horizontal: "center" };
    ws.getCell(`E${r}`).value = "[ ]";
    ws.getCell(`E${r}`).alignment = { horizontal: "center" };
  });

  styleCells(ws, headerRow + 1, headerRow + steps.length);

  // Sign-off
  const signRow = headerRow + steps.length + 2;
  ws.getCell(`A${signRow}`).value = "CUSTOMER SIGN-OFF";
  ws.getCell(`A${signRow}`).font = { bold: true, size: 11 };
  ws.getCell(`A${signRow + 1}`).value = "Work completed to satisfaction:";
  ws.getCell(`A${signRow + 2}`).value = "Customer Signature: ________________________________";
  ws.getCell(`D${signRow + 2}`).value = "Date: _______________";

  const path = join(OUTPUT_DIR, filename);
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// 7-8. Proposal Templates
// ============================================================
async function createProposal(
  title: string,
  filename: string,
  scopeItems: string[],
  materials: [string, number][],
  timeline: string
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet("Proposal");

  ws.columns = [
    { header: "", key: "a", width: 25 },
    { header: "", key: "b", width: 20 },
    { header: "", key: "c", width: 20 },
    { header: "", key: "d", width: 20 },
  ];

  let r = 1;
  ws.getCell(`A${r}`).value = "[YOUR COMPANY NAME]";
  ws.getCell(`A${r}`).font = { bold: true, size: 16, color: { argb: "0A1628" } };
  ws.mergeCells(`A${r}:D${r}`);

  r = 2;
  ws.getCell(`A${r}`).value = "[Your Address] | [Phone] | [Email] | [License #]";
  ws.getCell(`A${r}`).font = { size: 9, color: { argb: "888888" } };
  ws.mergeCells(`A${r}:D${r}`);

  r = 4;
  ws.getCell(`A${r}`).value = title;
  ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: "FF6200" } };
  ws.mergeCells(`A${r}:D${r}`);

  r = 6;
  ws.getCell(`A${r}`).value = "Prepared for:";
  ws.getCell(`A${r}`).font = { bold: true };
  ws.getCell(`B${r}`).value = "[Customer Name]";

  r = 7;
  ws.getCell(`A${r}`).value = "Property address:";
  ws.getCell(`A${r}`).font = { bold: true };
  ws.getCell(`B${r}`).value = "[Address]";

  r = 8;
  ws.getCell(`A${r}`).value = "Date:";
  ws.getCell(`A${r}`).font = { bold: true };
  ws.getCell(`B${r}`).value = "[Date]";

  r = 8;
  ws.getCell(`C${r}`).value = "Valid for:";
  ws.getCell(`C${r}`).font = { bold: true };
  ws.getCell(`D${r}`).value = "30 days";

  // Scope of work
  r = 10;
  ws.getCell(`A${r}`).value = "SCOPE OF WORK";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };

  scopeItems.forEach((item, i) => {
    ws.getCell(`A${r + 1 + i}`).value = `${i + 1}. ${item}`;
  });

  // Materials
  r = r + scopeItems.length + 2;
  ws.getCell(`A${r}`).value = "MATERIALS";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };

  r++;
  ws.getRow(r).values = ["Item", "", "Qty/Unit", "Est. Cost"];
  styleHeader(ws.getRow(r));

  materials.forEach((mat, i) => {
    const mr = r + 1 + i;
    ws.getCell(`A${mr}`).value = mat[0];
    ws.mergeCells(`A${mr}:B${mr}`);
    ws.getCell(`D${mr}`).value = mat[1];
    ws.getCell(`D${mr}`).numFmt = '"$"#,##0.00';
  });

  // Timeline
  const tRow = r + materials.length + 2;
  ws.getCell(`A${tRow}`).value = "TIMELINE";
  ws.getCell(`A${tRow}`).font = { bold: true, size: 12 };
  ws.getCell(`A${tRow + 1}`).value = timeline;

  // Payment terms
  const pRow = tRow + 3;
  ws.getCell(`A${pRow}`).value = "PAYMENT TERMS";
  ws.getCell(`A${pRow}`).font = { bold: true, size: 12 };
  ws.getCell(`A${pRow + 1}`).value = "50% deposit due upon acceptance of this proposal.";
  ws.getCell(`A${pRow + 2}`).value = "Remaining 50% due upon completion of work.";
  ws.getCell(`A${pRow + 3}`).value = "Accepted forms: Check, Credit Card, Zelle, Venmo.";

  // Signature
  const sRow = pRow + 5;
  ws.getCell(`A${sRow}`).value = "ACCEPTANCE";
  ws.getCell(`A${sRow}`).font = { bold: true, size: 12 };
  ws.getCell(`A${sRow + 2}`).value = "Customer Signature: ________________________________";
  ws.getCell(`C${sRow + 2}`).value = "Date: _______________";
  ws.getCell(`A${sRow + 4}`).value = "Contractor Signature: ________________________________";
  ws.getCell(`C${sRow + 4}`).value = "Date: _______________";

  const path = join(OUTPUT_DIR, filename);
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// 9-10. Contract Templates
// ============================================================
async function createContract(title: string, filename: string, clauses: string[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "RoughInHub";
  const ws = wb.addWorksheet("Contract");

  ws.columns = [{ header: "", key: "a", width: 90 }];

  let r = 1;
  ws.getCell(`A${r}`).value = title;
  ws.getCell(`A${r}`).font = { bold: true, size: 16, color: { argb: "0A1628" } };
  ws.getRow(r).height = 30;

  r = 3;
  ws.getCell(`A${r}`).value = "This agreement is entered into between:";
  r = 4;
  ws.getCell(`A${r}`).value = 'Contractor: [YOUR COMPANY NAME], License # [_______] ("Contractor")';
  r = 5;
  ws.getCell(`A${r}`).value = 'Customer: [CUSTOMER NAME] ("Customer")';
  r = 6;
  ws.getCell(`A${r}`).value = "Property Address: [SERVICE ADDRESS]";
  r = 7;
  ws.getCell(`A${r}`).value = "Effective Date: [DATE]";

  r = 9;
  clauses.forEach((clause, i) => {
    ws.getCell(`A${r}`).value = `${i + 1}. ${clause.split(":")[0]}`;
    ws.getCell(`A${r}`).font = { bold: true, size: 11 };
    r++;
    ws.getCell(`A${r}`).value = clause.split(":").slice(1).join(":").trim();
    ws.getCell(`A${r}`).alignment = { wrapText: true };
    ws.getRow(r).height = 45;
    r += 2;
  });

  // Signatures
  r += 1;
  ws.getCell(`A${r}`).value = "SIGNATURES";
  ws.getCell(`A${r}`).font = { bold: true, size: 12 };
  r += 2;
  ws.getCell(`A${r}`).value = "Contractor: ________________________________    Date: _______________";
  r += 2;
  ws.getCell(`A${r}`).value = "Customer:   ________________________________    Date: _______________";

  const path = join(OUTPUT_DIR, filename);
  await wb.xlsx.writeFile(path);
  return path;
}

// ============================================================
// MAIN: Generate all files, create blueprints, upload to Blob
// ============================================================
async function main() {
  // Create output directory
  const { mkdirSync } = await import("fs");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("\nGenerating 10 free plumbing artifacts...\n");

  // Generate all files
  const files = await Promise.all([
    // Bid Calculators
    createBathroomBidCalc(),
    createWaterHeaterCalc(),
    createServiceCallPricing(),

    // Service Checklists
    createChecklist(
      "Water Heater Service & Inspection Checklist",
      "WH Service",
      "water-heater-service-checklist.xlsx",
      [
        "Turn off gas/power supply to unit",
        "Check T&P relief valve for proper operation",
        "Inspect flue/venting for blockage or corrosion",
        "Check gas connections with leak detector solution",
        "Inspect burner assembly (gas) or elements (electric)",
        "Check thermostat settings and operation",
        "Drain 2-3 gallons to flush sediment",
        "Inspect anode rod condition (replace if < 1/2\" diameter)",
        "Check for water leaks at all connections",
        "Inspect expansion tank (if present) - check pressure",
        "Verify proper clearances from combustibles",
        "Test hot water temperature at nearest fixture (120F target)",
        "Document unit age, model, and serial number",
        "Advise customer on remaining useful life estimate",
      ],
      ["Adjustable wrench", "Garden hose", "Leak detector solution", "Multimeter", "Thermometer", "Anode rod socket (1-1/16\")", "Bucket"]
    ),

    createChecklist(
      "Drain Cleaning Job Checklist",
      "Drain Cleaning",
      "drain-cleaning-job-checklist.xlsx",
      [
        "Identify affected drain(s) and symptoms with customer",
        "Locate nearest cleanout access point",
        "Lay drop cloths to protect flooring",
        "Set up drain machine with appropriate cable size",
        "Feed cable into cleanout - note footage at obstruction",
        "Clear obstruction - note type (grease, roots, debris, etc.)",
        "Run water to verify drain flows freely",
        "Camera inspect line (if included in scope)",
        "Document findings and any line damage observed",
        "Clean work area and remove all debris",
        "Recommend follow-up treatment if needed (root killer, enzyme)",
        "Advise customer on preventative maintenance",
      ],
      ["Drain machine (3/8\" or 3/4\" cable)", "Drop cloths", "Bucket", "Camera system (if applicable)", "Gloves + eye protection", "Cleanout wrench", "Garden hose"]
    ),

    createChecklist(
      "Faucet Repair & Replacement Checklist",
      "Faucet Service",
      "faucet-repair-checklist.xlsx",
      [
        "Identify faucet brand, model, and type (compression/cartridge/ball/disc)",
        "Turn off hot and cold shut-off valves under sink",
        "Open faucet to relieve pressure",
        "Place towel in sink basin to catch small parts",
        "Remove handle(s) and trim",
        "Inspect cartridge/stem/seats for wear or damage",
        "Replace worn components (cartridge, O-rings, seats, springs)",
        "Reassemble faucet in reverse order",
        "Turn on supply valves slowly - check for leaks",
        "Test hot and cold operation",
        "Check under sink for drips after 5 minutes",
        "Clean work area",
      ],
      ["Basin wrench", "Adjustable wrench", "Allen key set", "Plumber's grease", "Replacement cartridge/parts", "Plumber's tape", "Towels/rags"]
    ),

    // Proposal Templates
    createProposal(
      "PLUMBING PROPOSAL - Residential Remodel",
      "residential-plumbing-proposal.xlsx",
      [
        "Remove and dispose of existing plumbing fixtures as specified",
        "Rough-in new supply and drain lines per approved layout",
        "Install new fixtures (toilet, vanity, shower valve) per customer selection",
        "Connect all fixtures to existing supply and drain systems",
        "Pressure test all new supply lines at 80 PSI for 30 minutes",
        "Final inspection coordination with local building department",
        "Clean up all work areas and remove debris daily",
      ],
      [
        ["Copper supply pipe + fittings", 185],
        ["ABS/PVC drain pipe + fittings", 120],
        ["Shut-off valves (1/4 turn)", 48],
        ["Shower valve (pressure balance)", 165],
        ["Toilet flange + wax ring", 25],
        ["P-traps + drain assemblies", 45],
        ["Misc. hangers, clamps, sealant", 60],
      ],
      "Estimated 3-4 working days from start date. Schedule dependent on fixture availability and inspection timing."
    ),

    createProposal(
      "EMERGENCY PLUMBING REPAIR PROPOSAL",
      "emergency-repair-proposal.xlsx",
      [
        "Locate and isolate source of leak/damage",
        "Perform temporary repair to stop active water damage",
        "Assess full scope of permanent repair needed",
        "Complete permanent repair using code-compliant materials",
        "Test repair under full system pressure",
        "Document all work with photos for insurance purposes",
      ],
      [
        ["Repair materials (pipe, fittings, valves)", 150],
        ["Water damage mitigation supplies", 75],
        ["Emergency labor (first 2 hours)", 350],
        ["Additional labor (per hour after)", 125],
      ],
      "Emergency repairs begin immediately upon approval. Permanent repairs completed within 24-48 hours pending parts availability."
    ),

    // Contract Templates
    createContract(
      "PLUMBING SERVICE AGREEMENT",
      "plumbing-service-agreement.xlsx",
      [
        "Scope of Work: Contractor agrees to perform plumbing services as described in the attached proposal/estimate. Any work beyond the original scope requires a written change order signed by both parties before work begins.",
        "Payment Terms: Customer agrees to pay 50% of the total estimated cost as a deposit before work begins. The remaining balance is due upon completion. Late payments are subject to 1.5% monthly interest. Contractor reserves the right to halt work if payments are not received as agreed.",
        "Warranty: Contractor warrants all labor for a period of one (1) year from the date of completion. Manufacturer warranties on parts and fixtures are passed through to the customer. This warranty does not cover damage caused by misuse, neglect, or acts of nature.",
        "Liability: Contractor carries general liability insurance and workers compensation coverage. Contractor is not liable for pre-existing conditions, concealed damage discovered during work, or damage caused by others. Customer is responsible for obtaining any required permits unless otherwise agreed.",
        "Change Orders: Any changes to the scope of work must be documented in writing and signed by both parties. Additional work will be billed at the agreed hourly rate plus materials at cost plus 25% markup.",
        "Cancellation: Either party may cancel this agreement with 48 hours written notice. Customer is responsible for payment of all work completed and materials purchased prior to cancellation. Deposits are non-refundable if work has commenced.",
        "Dispute Resolution: Any disputes arising from this agreement will first be addressed through good-faith negotiation. If unresolved, disputes will be submitted to binding arbitration in [County/State]. The prevailing party is entitled to reasonable attorney fees.",
        "Emergency Rates: After-hours service (before 7am, after 6pm, weekends, holidays) is billed at 1.5x the standard hourly rate. Emergency/same-day dispatch includes an additional $75 surcharge.",
      ]
    ),

    createContract(
      "WARRANTY & LIABILITY PROTECTION AGREEMENT",
      "warranty-liability-agreement.xlsx",
      [
        "Labor Warranty: All labor performed by Contractor is warranted for one (1) year from the date of completion. If any defect in workmanship appears during this period, Contractor will repair it at no additional charge, provided the defect is not caused by misuse, modification, or neglect.",
        "Parts Warranty: All parts and fixtures installed carry the manufacturer's warranty only. Contractor will assist Customer in filing warranty claims but is not responsible for manufacturer defects. Customer should retain all receipts and warranty documentation provided.",
        "Warranty Exclusions: This warranty does not cover damage from freezing pipes (if Customer fails to maintain adequate heat), chemical drain cleaners used by Customer, unauthorized repairs by third parties, or acts of nature including floods and earthquakes.",
        "Liability Limitation: Contractor's total liability under this agreement shall not exceed the total amount paid by Customer for the services rendered. Contractor is not liable for consequential, incidental, or indirect damages including but not limited to water damage to personal property, lost income, or temporary housing costs.",
        "Pre-Existing Conditions: Contractor is not responsible for pre-existing plumbing deficiencies, code violations, or concealed conditions discovered during the course of work. If such conditions are found, Contractor will notify Customer and provide a separate estimate for remediation.",
        "Insurance: Contractor maintains general liability insurance with minimum coverage of $1,000,000 per occurrence and workers compensation insurance as required by state law. Certificates of insurance are available upon request.",
        "Indemnification: Customer agrees to indemnify and hold harmless Contractor from any claims, damages, or expenses arising from Customer's misuse of the plumbing system, failure to follow maintenance recommendations, or unauthorized modifications after service is complete.",
        "Governing Law: This agreement is governed by the laws of [State]. Both parties consent to jurisdiction in [County] for any legal proceedings related to this agreement.",
      ]
    ),
  ]);

  console.log(`Generated ${files.length} files in ${OUTPUT_DIR}\n`);

  // Get or create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@roughinhub.com" },
    update: {},
    create: { email: "admin@roughinhub.com", name: "RoughInHub", isAdmin: true },
  });

  // Blueprint definitions
  const blueprintDefs = [
    {
      slug: "free-bathroom-remodel-bid-calculator",
      name: "Free Bathroom Remodel Bid Calculator",
      description: "Pre-built Excel bid calculator for bathroom remodel rough-ins. Includes material costs, labor hours, markup percentage, and automatic profit calculation. Customize the rates for your market.",
      longDescription: "Stop guessing on bathroom remodel bids. This spreadsheet includes common line items for residential bathroom rough-ins with realistic material costs and labor estimates. All formulas are built in so you just update quantities and rates.\n\nIncludes: supply lines, drain pipe, vent pipe, shower valve, toilet flange, shut-off valves, permit fees, and debris removal. Automatic markup and profit calculation at the bottom.",
      category: "estimating-bidding",
      type: "excel",
      region: "Nationwide",
      tags: "bid calculator,bathroom,remodel,free,estimating",
      file: files[0],
    },
    {
      slug: "free-water-heater-estimate-calculator",
      name: "Free Water Heater Replacement Estimate Calculator",
      description: "Two-tab Excel calculator covering standard tank and tankless water heater replacements. Includes material costs, labor, permits, and disposal fees with automatic totals.",
      longDescription: "Quote water heater replacements accurately every time. Tab 1 covers standard 50-gallon gas tank replacements. Tab 2 covers tankless upgrades with the additional gas line and venting work.\n\nBoth tabs include realistic material costs, labor estimates, permit fees, and automatic markup calculation. Great for presenting options to customers side by side.",
      category: "estimating-bidding",
      type: "excel",
      region: "Nationwide",
      tags: "water heater,estimate,tankless,free,calculator",
      file: files[1],
    },
    {
      slug: "free-service-call-pricing-sheet",
      name: "Free Service Call Pricing Sheet",
      description: "Ready-to-use pricing matrix for 15 common plumbing service calls. Includes base fees, hourly rates, estimated hours, and materials with automatic quote calculation.",
      longDescription: "Know your numbers before you pick up the phone. This pricing sheet covers 15 of the most common residential service calls from faucet repairs to sump pump replacements.\n\nEach service has a base fee, hourly rate, estimated hours, and material cost that auto-calculates a quote price. Customize the rates in columns B and C to match your local market. Includes notes on after-hours and emergency surcharges.",
      category: "service-repair",
      type: "excel",
      region: "Nationwide",
      tags: "pricing,service calls,free,rate sheet",
      file: files[2],
    },
    {
      slug: "free-water-heater-service-checklist",
      name: "Free Water Heater Service & Inspection Checklist",
      description: "14-step inspection checklist with pass/fail fields, equipment list, and customer sign-off section. Covers gas and electric units. Print it or use on a tablet.",
      longDescription: "Never miss a step on a water heater service call. This checklist walks through every inspection point from T&P valve testing to anode rod condition. Includes a customer sign-off section for liability protection.\n\nPrintable format with checkboxes, equipment list, and space for notes. Covers both gas and electric units.",
      category: "service-repair",
      type: "excel",
      region: "Nationwide",
      tags: "checklist,water heater,inspection,free,service",
      file: files[3],
    },
    {
      slug: "free-drain-cleaning-job-checklist",
      name: "Free Drain Cleaning Job Checklist",
      description: "12-step job checklist for drain cleaning and snaking with equipment list, documentation fields, and customer sign-off. Covers camera inspection notes too.",
      longDescription: "Run every drain cleaning job by the book. This checklist covers the full process from customer intake through cleanup, including camera inspection documentation and follow-up recommendations.\n\nIncludes equipment list, pass/fail checkboxes, and a customer sign-off section. Great for training new techs on proper drain cleaning procedures.",
      category: "service-repair",
      type: "excel",
      region: "Nationwide",
      tags: "checklist,drain cleaning,snaking,free,service",
      file: files[4],
    },
    {
      slug: "free-faucet-repair-checklist",
      name: "Free Faucet Repair & Replacement Checklist",
      description: "12-step service checklist for faucet repairs covering all faucet types (compression, cartridge, ball, disc). Includes equipment list and leak verification steps.",
      longDescription: "Handle every faucet job professionally. This checklist covers the repair process from identification through testing, with steps specific to different faucet types.\n\nIncludes equipment list, step-by-step procedure with checkboxes, and a 5-minute post-repair leak check reminder. Perfect for service techs and apprentices.",
      category: "service-repair",
      type: "excel",
      region: "Nationwide",
      tags: "checklist,faucet,repair,free,service",
      file: files[5],
    },
    {
      slug: "free-residential-plumbing-proposal",
      name: "Free Residential Plumbing Proposal Template",
      description: "Professional proposal template with scope of work, materials list, timeline, payment terms, and signature blocks. Ready to customize with your company info.",
      longDescription: "Win more jobs with professional proposals. This template includes everything a residential plumbing proposal needs: company header, customer info, detailed scope of work, itemized materials list, project timeline, and payment terms.\n\nJust replace the bracketed placeholders with your company details and customize the scope for each job. Includes dual signature blocks for customer acceptance.",
      category: "proposals-contracts",
      type: "excel",
      region: "Nationwide",
      tags: "proposal,residential,remodel,free,template",
      file: files[6],
    },
    {
      slug: "free-emergency-repair-proposal",
      name: "Free Emergency Plumbing Repair Proposal Template",
      description: "Quick-turnaround proposal template for emergency repairs. Includes scope, emergency labor rates, materials, and photo documentation note for insurance claims.",
      longDescription: "Get emergency repair proposals signed fast. This template is designed for urgency with a clear scope, emergency pricing structure, and a note about photo documentation for insurance purposes.\n\nIncludes separate line items for temporary vs. permanent repairs, emergency labor rates, and a 24-48 hour completion timeline. Customize with your rates and company info.",
      category: "proposals-contracts",
      type: "excel",
      region: "Nationwide",
      tags: "proposal,emergency,repair,free,template",
      file: files[7],
    },
    {
      slug: "free-plumbing-service-agreement",
      name: "Free Plumbing Service Agreement Template",
      description: "8-clause service agreement covering scope, payment, warranty, liability, change orders, cancellation, disputes, and emergency rates. Protects your business on every job.",
      longDescription: "Stop working without a contract. This service agreement covers the eight most important clauses every plumber needs: scope of work, payment terms with late payment provisions, one-year labor warranty, liability limitations, change order process, cancellation policy, dispute resolution, and emergency rate terms.\n\nCustomize the bracketed fields with your company info and state. Print double-sided for a professional one-page contract.",
      category: "proposals-contracts",
      type: "excel",
      region: "Nationwide",
      tags: "contract,service agreement,legal,free,template",
      file: files[8],
    },
    {
      slug: "free-warranty-liability-agreement",
      name: "Free Warranty & Liability Protection Agreement",
      description: "8-clause warranty and liability agreement with coverage terms, exclusions, insurance requirements, and indemnification. The legal protection every plumber needs.",
      longDescription: "Protect yourself from callbacks and claims. This agreement clearly defines what your warranty covers, what it excludes, and limits your liability exposure.\n\nIncludes: one-year labor warranty, manufacturer pass-through warranty, exclusions for misuse and pre-existing conditions, liability cap at total amount paid, insurance requirements, and indemnification language. Customize for your state and business.",
      category: "proposals-contracts",
      type: "excel",
      region: "Nationwide",
      tags: "warranty,liability,contract,legal,free,template",
      file: files[9],
    },
  ];

  // Create blueprints and upload files
  const blobToken = process.env.BLOB_DEV_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("No blob token found. Set BLOB_DEV_READ_WRITE_TOKEN in .env.local");
    return;
  }

  for (const def of blueprintDefs) {
    // Create or update blueprint
    const blueprint = await prisma.blueprint.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description: def.description,
        longDescription: def.longDescription,
        category: def.category,
        type: def.type,
        region: def.region,
        tags: def.tags,
        isFree: true,
        price: 0,
        featured: false,
        hidden: false,
        contentAcknowledgedAt: new Date(),
      },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        longDescription: def.longDescription,
        category: def.category,
        type: def.type,
        region: def.region,
        tags: def.tags,
        isFree: true,
        price: 0,
        featured: false,
        hidden: false,
        contentAcknowledgedAt: new Date(),
        authorId: admin.id,
      },
    });

    // Upload file to Vercel Blob
    const fileBuffer = await readFile(def.file);
    const filename = def.file.split("/").pop()!;

    const blob = await put(`blueprints/${blueprint.id}/${filename}`, fileBuffer, {
      access: "private",
      addRandomSuffix: true,
      token: blobToken,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Delete existing files for this blueprint (idempotent re-runs)
    await prisma.blueprintFile.deleteMany({ where: { blueprintId: blueprint.id } });

    // Create file record
    await prisma.blueprintFile.create({
      data: {
        blueprintId: blueprint.id,
        filename,
        blobUrl: blob.url,
        size: fileBuffer.length,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    console.log(`  ✓ ${def.name} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n✅ 10 free plumbing artifacts created and uploaded to RoughInHub.\n`);
  console.log("Categories covered:");
  console.log("  - 3 Bid Calculators (bathroom remodel, water heater, service call pricing)");
  console.log("  - 3 Service Checklists (water heater, drain cleaning, faucet repair)");
  console.log("  - 2 Proposal Templates (residential remodel, emergency repair)");
  console.log("  - 2 Contract Templates (service agreement, warranty & liability)");
  console.log("\nAll marked as FREE and published. Ready for download.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
