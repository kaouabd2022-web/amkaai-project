import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// ❗ تأكد من وجود المفتاح قبل إنشاء Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("USER_ID:", userId);

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    if (!user.email) {
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

    console.log("PRICE_ID:", priceId);

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

    if (!session || !session.url) {
      console.error("Stripe session error:", session);
      return NextResponse.json(
        { error: "Stripe session creation failed" },
        { status: 500 }
      );
    }

    // DB not critical (لا يطيح السيرفر إذا فشل)
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
    console.error("🔥 FULL CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}