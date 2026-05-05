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

    if (!user || !user.email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      success_url: "https://ai-video-site.onrender.com/dashboard",
      cancel_url: "https://ai-video-site.onrender.com/ai-image",

      metadata: {
        userId,
      },
    });

    await db.abandonedCheckout.create({
      data: {
        userId,
        email: user.email,
        checkoutUrl: session.url!,
        stripeSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}