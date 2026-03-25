import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { getSafeOrigin } from "@/lib/origin";
import Stripe from "stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`checkout:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { skillId } = await req.json();
  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { author: { select: { stripeAccountId: true } } },
  });
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  if (skill.isFree) {
    return NextResponse.json({ error: "This skill is free" }, { status: 400 });
  }

  // Check if already purchased
  const existing = await prisma.purchase.findUnique({
    where: { userId_skillId: { userId: session.user.id, skillId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  const origin = getSafeOrigin(req.headers.get("origin"));
  const amountCents = Math.round(skill.price * 100);
  const feeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));

  // Build checkout session params
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: skill.name,
            description: skill.description,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      skillId: skill.id,
      userId: session.user.id,
    },
    success_url: `${origin}/dashboard?purchased=${skill.slug}`,
    cancel_url: `${origin}/skills/${skill.slug}`,
  };

  // Route funds to publisher if they have a connected Stripe account
  if (skill.author.stripeAccountId) {
    params.payment_intent_data = {
      application_fee_amount: feeCents,
      transfer_data: {
        destination: skill.author.stripeAccountId,
      },
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: checkoutSession.url });
}
