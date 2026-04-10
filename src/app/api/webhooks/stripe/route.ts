import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { DOWNLOAD_TOKEN_EXPIRY_DAYS } from "@/lib/constants";
import { auditInfo, auditWarn, auditCritical } from "@/lib/audit";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    auditCritical("webhook.signature_failed", { metadata: { ip: req.headers.get("x-forwarded-for") } });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  auditInfo("webhook.received", { metadata: { eventType: event.type, eventId: event.id } });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    if (session.payment_status === "paid" && metadata.blueprintId && metadata.userId) {
      // Validate that both the user and blueprint actually exist
      const [user, blueprint] = await Promise.all([
        prisma.user.findUnique({ where: { id: metadata.userId }, select: { id: true } }),
        prisma.blueprint.findUnique({ where: { id: metadata.blueprintId }, select: { id: true } }),
      ]);
      if (!user || !blueprint) {
        auditWarn("webhook.invalid_metadata", {
          metadata: { userId: metadata.userId, blueprintId: metadata.blueprintId, sessionId: session.id },
        });
        return NextResponse.json({ received: true });
      }

      const amount = (session.amount_total || 0) / 100;

      // Single blueprint purchase
      const purchase = await prisma.purchase.upsert({
        where: { userId_blueprintId: { userId: metadata.userId, blueprintId: metadata.blueprintId } },
        create: {
          userId: metadata.userId,
          blueprintId: metadata.blueprintId,
          stripeSessionId: session.id,
          amount,
        },
        update: {},
      });

      await prisma.downloadToken.upsert({
        where: { purchaseId: purchase.id },
        create: {
          purchaseId: purchase.id,
          token: generateToken(),
          expiresAt: new Date(Date.now() + DOWNLOAD_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
        update: {},
      });

      auditInfo("checkout.completed", {
        userId: metadata.userId,
        blueprintId: metadata.blueprintId,
        metadata: { amount, sessionId: session.id },
      });
    }
  }

  return NextResponse.json({ received: true });
}
