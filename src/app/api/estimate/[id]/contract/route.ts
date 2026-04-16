import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { EstimateData } from "@/lib/estimate";

const client = new Anthropic();

type RouteParams = { params: Promise<{ id: string }> };

const SYSTEM_PROMPT = `You are a legal document writer for plumbing contractors. Generate a professional service agreement/contract based on the estimate data provided.

The contract should include:
1. Parties (Contractor and Customer)
2. Scope of Work (from the estimate)
3. Price and Payment Terms (50% deposit due before work begins, balance due on completion)
4. Timeline (estimated start and completion, subject to scheduling)
5. Materials (Contractor provides all materials as listed in estimate)
6. Warranty (1 year labor warranty, manufacturer warranty on materials)
7. Change Orders (any changes to scope require written authorization and may affect price/timeline)
8. Cancellation (customer may cancel within 3 business days of signing for full refund of deposit)
9. Liability (Contractor carries general liability insurance, liability limited to contract amount)
10. Permits (Contractor responsible for obtaining required permits, permit fees additional if not included in estimate)
11. Acceptance and signatures

Rules:
- Use plain, professional language a homeowner can understand
- Do not use em dashes
- Do not use excessive legal jargon
- Include blank lines for signatures and dates
- Reference the specific dollar amounts from the estimate
- Keep it to one page when possible
- Return ONLY the contract text, no markdown formatting, no explanation`;

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check Pro status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionStatus: true,
      businessName: true,
      businessPhone: true,
      businessEmail: true,
      licenseNumber: true,
    },
  });

  if (user?.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate || estimate.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: EstimateData = JSON.parse(estimate.data);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const prompt = `Generate a service agreement for this plumbing job:

Contractor: ${user.businessName || "[Contractor Name]"}
Phone: ${user.businessPhone || "[Phone]"}
Email: ${user.businessEmail || "[Email]"}
License: ${user.licenseNumber || "[License Number]"}

Customer: ${data.customerName || "[Customer Name]"}
Address: ${data.customerAddress || "[Customer Address]"}

Scope of Work: ${data.scopeOfWork}

Materials (${data.lineItems.length} items): $${fmt(data.materialSubtotal)}
Labor: ${data.laborHours} hours at $${fmt(data.laborRate)}/hr = $${fmt(data.laborSubtotal)}
Markup: ${data.markupPercent}% = $${fmt(data.markupAmount)}
Total Price: $${fmt(data.total)}
Deposit (50%): $${fmt(data.total / 2)}

Notes: ${data.notes || "None"}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Failed to generate contract" }, { status: 500 });
    }

    const contractContent = textBlock.text.trim();

    // Save to estimate
    await prisma.estimate.update({
      where: { id },
      data: { contractData: JSON.stringify({ content: contractContent }) },
    });

    return NextResponse.json({ content: contractContent });
  } catch (err) {
    console.error("Contract generation failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Failed to generate contract. Try again." }, { status: 500 });
  }
}
