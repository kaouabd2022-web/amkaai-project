import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_URL;

    if (!priceId) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
    }

    if (!baseUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_URL" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${baseUrl}/dashboard`,
      cancel_url: `${baseUrl}/ai-image`,

      metadata: {
        userId,
      },
    });

    // ⚠️ حماية session.url
    if (!session.url) {
      throw new Error("Stripe session URL missing");
    }

    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl: session.url,
          stripeSessionId: session.id,
        },
      });
    } catch (dbError) {
      console.log("DB error ignored:", dbError);
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("🔥 Checkout error FULL:", error);

    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}