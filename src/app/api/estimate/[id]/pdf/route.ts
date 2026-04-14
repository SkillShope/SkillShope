import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import type { EstimateData } from "@/lib/estimate";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { businessName: true, businessPhone: true, businessEmail: true, licenseNumber: true },
  });

  const data: EstimateData = JSON.parse(estimate.data);
  const fmt = (n: number) => (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const estNum = estimate.estimateNumber || estimate.id.slice(-8).toUpperCase();
  const businessName = user?.businessName || "";
  const dateStr = new Date(estimate.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 50, bottom: 60, left: 50, right: 50 },
    info: {
      Title: `Estimate ${estNum}`,
      Author: businessName || "RoughInHub",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const black = "#1a1a1a";
  const gray = "#555555";
  const lightGray = "#999999";
  const accent = "#e85d2a";
  const pageWidth = 512;
  const footerY = 732;

  // Helper: draw footer on current page (uses only strokes and a single absolute text)
  const drawFooter = () => {
    doc.save();
    doc.moveTo(50, footerY).lineTo(50 + pageWidth, footerY).lineWidth(0.3).strokeColor("#dddddd").stroke();
    doc.font("Helvetica").fontSize(7).fillColor(lightGray);
    doc.text(
      `${businessName || "RoughInHub"}  |  ${estNum}  |  Valid for 30 days from date of issue.`,
      50, footerY + 4, { lineBreak: false }
    );
    doc.restore();
  };

  // Helper: new page with footer on previous
  const newPage = () => {
    drawFooter();
    doc.addPage();
  };

  // Check space, break page if needed
  const ensureSpace = (needed: number) => {
    if (doc.y > footerY - 20 - needed) {
      newPage();
    }
  };

  // ── Business header ──
  if (businessName) {
    doc.font("Helvetica-Bold").fontSize(16).fillColor(black).text(businessName, 50, 50);
    const contactParts: string[] = [];
    if (user?.businessPhone) contactParts.push(user.businessPhone);
    if (user?.businessEmail) contactParts.push(user.businessEmail);
    if (user?.licenseNumber) contactParts.push(`License #${user.licenseNumber}`);
    if (contactParts.length > 0) {
      doc.font("Helvetica").fontSize(9).fillColor(gray).text(contactParts.join("  |  "), 50, doc.y + 2);
    }
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y).lineWidth(0.5).strokeColor("#dddddd").stroke();
    doc.moveDown(0.8);
  }

  // ── Title row: custom title on left, signature fields on right ──
  const titleY = doc.y;
  const titleText = (data.estimateTitle || "ESTIMATE").slice(0, 35);
  // Auto-size: 20pt for short titles, scales down for longer ones
  const titleFontSize = titleText.length <= 12 ? 20 : titleText.length <= 20 ? 17 : titleText.length <= 28 ? 15 : 13;
  doc.font("Helvetica-Bold").fontSize(titleFontSize).fillColor(black).text(titleText, 50, titleY, { lineBreak: false });
  doc.font("Helvetica").fontSize(9).fillColor(lightGray).text(`Date: ${dateStr}  |  ${estNum.slice(0, 30)}`, 50, titleY + titleFontSize + 4, { lineBreak: false });

  // Signature + date on the right side of the title row
  // Signature line
  doc.moveTo(340, titleY + 24).lineTo(470, titleY + 24).lineWidth(0.5).strokeColor("#cccccc").stroke();
  // Date line
  doc.moveTo(490, titleY + 24).lineTo(562, titleY + 24).lineWidth(0.5).strokeColor("#cccccc").stroke();
  // Labels below lines
  doc.font("Helvetica").fontSize(7).fillColor(lightGray);
  doc.text("Customer Signature", 340, titleY + 27, { lineBreak: false });
  doc.text("Date", 490, titleY + 27, { lineBreak: false });

  doc.y = titleY + titleFontSize + 20;
  doc.moveDown(0.5);

  // ── Customer info ──
  if (data.customerName || data.customerAddress) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(gray).text("PREPARED FOR", 50, doc.y);
    if (data.customerName) {
      doc.font("Helvetica").fontSize(10).fillColor(black).text(data.customerName);
    }
    if (data.customerAddress) {
      doc.font("Helvetica").fontSize(9).fillColor(gray).text(data.customerAddress);
    }
    doc.moveDown(0.8);
  }

  // ── Scope of work ──
  doc.font("Helvetica-Bold").fontSize(9).fillColor(gray).text("SCOPE OF WORK", 50, doc.y);
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10).fillColor(black).text(data.scopeOfWork, { width: pageWidth, lineGap: 2 });
  doc.moveDown(0.8);

  // ── Materials table ──
  doc.font("Helvetica-Bold").fontSize(9).fillColor(gray).text("MATERIALS", 50, doc.y);
  doc.moveDown(0.4);

  const tableTop = doc.y;
  doc.rect(50, tableTop, pageWidth, 18).fill("#f5f5f5");
  doc.font("Helvetica-Bold").fontSize(8).fillColor(gray);
  doc.text("Description", 55, tableTop + 5, { lineBreak: false });
  doc.text("Qty (Ea.)", 310, tableTop + 5, { width: 50, align: "right", lineBreak: false });
  doc.text("Price", 370, tableTop + 5, { width: 60, align: "right", lineBreak: false });
  doc.text("Total", 440, tableTop + 5, { width: 70, align: "right", lineBreak: false });

  let y = tableTop + 22;
  doc.font("Helvetica").fontSize(9).fillColor(black);

  for (const item of data.lineItems) {
    if (y > footerY - 40) {
      drawFooter();
      doc.addPage();
      y = 50;
    }
    doc.text(item.description, 55, y, { width: 250, lineBreak: false });
    doc.text(String(item.quantity), 310, y, { width: 50, align: "right", lineBreak: false });
    doc.text(`$${fmt(item.unitPrice)}`, 370, y, { width: 60, align: "right", lineBreak: false });
    doc.text(`$${fmt(item.total)}`, 440, y, { width: 70, align: "right", lineBreak: false });
    y += 16;
  }

  // Separator
  doc.moveTo(50, y + 3).lineTo(50 + pageWidth, y + 3).lineWidth(0.5).strokeColor("#dddddd").stroke();
  y += 12;

  // ── Totals ──
  // Labels left-aligned, amounts right-aligned at page edge
  const tX = 340; // label start
  const amtRight = 562; // right edge of page (50 + 512)
  const amtW = 80; // width for right-aligned amount

  const totalRow = (label: string, amount: string) => {
    doc.text(label, tX, y, { lineBreak: false });
    doc.text(amount, amtRight - amtW, y, { width: amtW, align: "right", lineBreak: false });
    y += 16;
  };

  doc.font("Helvetica").fontSize(9).fillColor(gray);
  totalRow("Materials", `$${fmt(data.materialSubtotal)}`);
  totalRow(`Labor (${data.laborHours} hrs @ $${fmt(data.laborRate)}/hr)`, `$${fmt(data.laborSubtotal)}`);
  totalRow(`Markup (${data.markupPercent}%)`, `$${fmt(data.markupAmount)}`);

  if (data.taxPercent && data.taxPercent > 0) {
    totalRow("Subtotal", `$${fmt(data.subtotal ?? (data.materialSubtotal + data.laborSubtotal + data.markupAmount))}`);
    totalRow(`Tax (${data.taxPercent}%)`, `$${fmt(data.taxAmount ?? 0)}`);
    y -= 12; // tighten before total line
  }

  doc.moveTo(tX, y + 4).lineTo(amtRight, y + 4).lineWidth(0.5).strokeColor("#dddddd").stroke();
  y += 12;

  doc.font("Helvetica-Bold").fontSize(12).fillColor(accent);
  doc.text("TOTAL", tX, y, { lineBreak: false });
  doc.text(`$${fmt(data.total)}`, amtRight - amtW, y, { width: amtW, align: "right", lineBreak: false });
  y += 22;

  // ── Notes ──
  if (data.notes) {
    doc.y = y;
    ensureSpace(50);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(gray).text("NOTES & CONDITIONS", 50, doc.y);
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(8).fillColor(gray).text(data.notes, 50, doc.y, { width: pageWidth, lineGap: 1.5 });
  }

  // ── Footer on final page ──
  drawFooter();

  doc.end();

  await new Promise<void>((resolve) => doc.on("end", resolve));
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RIH-${estimate.estimateNumber || estimate.id.slice(-8).toUpperCase()}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
