import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

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
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { skillId, userId } = session.metadata || {};

    if (skillId && userId && session.payment_status === "paid") {
      // Idempotent: upsert to handle duplicate webhook deliveries
      await prisma.purchase.upsert({
        where: { userId_skillId: { userId, skillId } },
        create: {
          userId,
          skillId,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
        },
        update: {},
      });
    }
  }

  return NextResponse.json({ received: true });
}
