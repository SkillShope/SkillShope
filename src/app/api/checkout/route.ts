import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { getSafeOrigin } from "@/lib/origin";
import Stripe from "stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { auditInfo } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`checkout:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { blueprintId } = await req.json();
  if (!blueprintId) {
    return NextResponse.json({ error: "blueprintId required" }, { status: 400 });
  }

  const blueprint = await prisma.blueprint.findUnique({
    where: { id: blueprintId },
    include: { author: { select: { stripeAccountId: true } } },
  });
  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  if (blueprint.isFree) {
    return NextResponse.json({ error: "This blueprint is free" }, { status: 400 });
  }

  // Check if already purchased
  const existing = await prisma.purchase.findUnique({
    where: { userId_blueprintId: { userId: session.user.id, blueprintId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  const origin = getSafeOrigin(req.headers.get("origin"));
  const amountCents = Math.round(blueprint.price * 100);
  const feeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));

  // Build checkout session params
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: blueprint.name,
            description: blueprint.description,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      blueprintId: blueprint.id,
      userId: session.user.id,
    },
    success_url: `${origin}/dashboard?purchased=${blueprint.slug}`,
    cancel_url: `${origin}/blueprints/${blueprint.slug}`,
  };

  // Route funds to publisher if they have a connected Stripe account
  if (blueprint.author.stripeAccountId) {
    params.payment_intent_data = {
      application_fee_amount: feeCents,
      transfer_data: {
        destination: blueprint.author.stripeAccountId,
      },
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);

  auditInfo("checkout.started", {
    userId: session.user.id,
    blueprintId,
    metadata: { amount: blueprint.price, sessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
