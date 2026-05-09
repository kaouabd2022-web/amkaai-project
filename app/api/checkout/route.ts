import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST() {
  try {
    const { userId } = await await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧑‍💻 user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // 💳 إنشاء session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      success_url: "http://localhost:3000/dashboard",
      cancel_url: "http://localhost:3000/ai-image",

      metadata: {
        userId,
      },
    });

    // 💾 حفظ abandoned checkout
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