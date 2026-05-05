import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: "test@email.com",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Test Product" },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],

      success_url: "https://ai-video-site.onrender.com",
      cancel_url: "https://ai-video-site.onrender.com",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return NextResponse.json({ error: "Stripe failed" }, { status: 500 });
  }
}