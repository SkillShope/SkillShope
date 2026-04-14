import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { FREE_ESTIMATE_LIMIT, PRO_ESTIMATE_LIMIT } from "@/lib/estimate";
import type { EstimateData } from "@/lib/estimate";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert plumbing estimator with 20+ years of experience pricing residential and commercial plumbing jobs across the United States. You generate accurate, professional estimates.

Given a job description (and optionally photos), produce a JSON estimate with this exact structure:

{
  "estimateTitle": "ESTIMATE",
  "scopeOfWork": "2-4 sentence professional description of the work to be performed",
  "lineItems": [
    { "description": "item name", "quantity": 1, "unit": "each", "unitPrice": 25.00, "total": 25.00 }
  ],
  "laborHours": 4,
  "laborRate": 95,
  "laborSubtotal": 380,
  "materialSubtotal": 0,
  "markupPercent": 20,
  "markupAmount": 0,
  "taxPercent": 0,
  "taxAmount": 0,
  "subtotal": 0,
  "total": 0,
  "notes": "Any important caveats, assumptions, or conditions",
  "customerName": "",
  "customerAddress": ""
}

Rules:
- Line items should include ALL materials: fittings, pipe, valves, fixtures, sealants, hardware, supply lines, etc.
- Use realistic 2026 US material prices from major suppliers (Home Depot, Ferguson, etc.)
- Unit prices should reflect contractor pricing, not retail
- Labor rate should be $75-125/hr depending on job complexity and market (default $95)
- Markup should be 15-25% (default 20%)
- taxPercent should default to 0 (user will set their local rate)
- materialSubtotal = sum of all lineItem totals
- markupAmount = (materialSubtotal + laborSubtotal) * markupPercent / 100
- subtotal = materialSubtotal + laborSubtotal + markupAmount
- taxAmount = subtotal * taxPercent / 100
- total = subtotal + taxAmount
- Calculate all math correctly
- Notes should mention assumptions (e.g., "Assumes accessible crawlspace", "Excludes permit fees")
- Do not include permit fees in line items (mention in notes)
- Do not use em dashes
- Return ONLY valid JSON, no markdown, no explanation`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to generate estimates" }, { status: 401 });
  }

  const { allowed } = rateLimit(`estimate:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Slow down. Try again in a minute." }, { status: 429 });
  }

  const { jobDescription, jobType, photoUrls } = await req.json();

  if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 10) {
    return NextResponse.json({ error: "Describe the job in at least 10 characters." }, { status: 400 });
  }

  if (jobDescription.length > 5000) {
    return NextResponse.json({ error: "Job description too long. Keep it under 5000 characters." }, { status: 400 });
  }

  // Check monthly usage limit
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  });

  const isPro = user?.subscriptionStatus === "active";
  const limit = isPro ? PRO_ESTIMATE_LIMIT : FREE_ESTIMATE_LIMIT;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await prisma.estimate.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfMonth },
    },
  });

  if (monthlyCount >= limit) {
    if (!isPro) {
      return NextResponse.json({
        error: "You've used your 3 free estimates this month. Upgrade to Pro for 30 estimates/month.",
        code: "LIMIT_REACHED",
      }, { status: 403 });
    }
    return NextResponse.json({
      error: "You've reached your monthly estimate limit.",
      code: "LIMIT_REACHED",
    }, { status: 403 });
  }

  // Build the user message
  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

  // Add photos if provided (vision)
  if (photoUrls && Array.isArray(photoUrls)) {
    for (const url of photoUrls.slice(0, 3)) {
      if (typeof url === "string" && url.startsWith("data:image/")) {
        const mediaType = url.split(";")[0].split(":")[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        const data = url.split(",")[1];
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data },
        });
      }
    }
  }

  content.push({
    type: "text",
    text: `Job type: ${jobType || "repair"}\n\nJob description: ${jobDescription.trim()}`,
  });

  try {
    // Use Haiku for fast, cheap generation
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Failed to generate estimate" }, { status: 500 });
    }

    // Parse the JSON response
    let estimateData: EstimateData;
    try {
      estimateData = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: "Failed to parse estimate" }, { status: 500 });
      }
      estimateData = JSON.parse(jsonMatch[0]);
    }

    // Recalculate totals to ensure correctness
    estimateData.materialSubtotal = estimateData.lineItems.reduce((sum, item) => sum + item.total, 0);
    estimateData.laborSubtotal = estimateData.laborHours * estimateData.laborRate;
    estimateData.markupAmount =
      (estimateData.materialSubtotal + estimateData.laborSubtotal) * estimateData.markupPercent / 100;
    estimateData.estimateTitle = estimateData.estimateTitle || "ESTIMATE";
    estimateData.taxPercent = estimateData.taxPercent || 0;
    estimateData.subtotal = estimateData.materialSubtotal + estimateData.laborSubtotal + estimateData.markupAmount;
    estimateData.taxAmount = estimateData.subtotal * estimateData.taxPercent / 100;
    estimateData.total = estimateData.subtotal + estimateData.taxAmount;

    // Round all dollar amounts to 2 decimal places
    estimateData.materialSubtotal = Math.round(estimateData.materialSubtotal * 100) / 100;
    estimateData.laborSubtotal = Math.round(estimateData.laborSubtotal * 100) / 100;
    estimateData.markupAmount = Math.round(estimateData.markupAmount * 100) / 100;
    estimateData.subtotal = Math.round(estimateData.subtotal * 100) / 100;
    estimateData.taxAmount = Math.round(estimateData.taxAmount * 100) / 100;
    estimateData.total = Math.round(estimateData.total * 100) / 100;
    estimateData.lineItems = estimateData.lineItems.map((item) => ({
      ...item,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));

    // Auto-generate estimate number (EST-001, EST-002, etc.)
    const userEstimateCount = await prisma.estimate.count({
      where: { userId: session.user.id },
    });
    const estimateNumber = `EST-${String(userEstimateCount + 1).padStart(3, "0")}`;

    // Save to database
    const estimate = await prisma.estimate.create({
      data: {
        userId: session.user.id,
        estimateNumber,
        jobDescription: jobDescription.trim(),
        jobType: jobType || "repair",
        photoUrls: photoUrls ? JSON.stringify(photoUrls) : null,
        data: JSON.stringify(estimateData),
      },
    });

    return NextResponse.json({
      id: estimate.id,
      estimateNumber: estimate.estimateNumber,
      data: estimateData,
      usage: {
        used: monthlyCount + 1,
        limit,
        isPro,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Estimate generation failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Failed to generate estimate. Try again." }, { status: 500 });
  }
}
