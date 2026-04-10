import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true, stripePayoutsEnabled: true },
  });

  if (!user?.stripeAccountId) {
    return NextResponse.json({ connected: false, payoutsEnabled: false });
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const payoutsEnabled = account.payouts_enabled ?? false;

    // Sync payout status to database
    if (payoutsEnabled !== user.stripePayoutsEnabled) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripePayoutsEnabled: payoutsEnabled },
      });
    }

    // Auto-unhide blueprints when payouts become enabled
    if (payoutsEnabled && !user.stripePayoutsEnabled) {
      await prisma.blueprint.updateMany({
        where: { authorId: session.user.id, hidden: true },
        data: { hidden: false },
      });
    }

    return NextResponse.json({
      connected: true,
      payoutsEnabled,
      chargesEnabled: account.charges_enabled ?? false,
    });
  } catch {
    return NextResponse.json({ connected: false, payoutsEnabled: false });
  }
}
