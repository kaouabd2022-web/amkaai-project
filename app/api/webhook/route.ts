import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT");

  const body = await req.text();

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Signature verification failed:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("📦 Event:", event.type);

  try {
    // =============================
    // 💰 CHECKOUT SUCCESS
    // =============================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const email = session.customer_details?.email;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      console.log("💰 Payment success");

      const items = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 1 }
      );

      const priceId = items.data[0]?.price?.id;

      let plan: "FREE" | "PRO" | "PREMIUM" = "FREE";
      let credits = 10;

      if (priceId === process.env.STRIPE_PRICE_PRO) {
        plan = "PRO";
        credits = 100;
      }

      if (priceId === process.env.STRIPE_PRICE_PREMIUM) {
        plan = "PREMIUM";
        credits = 300;
      }

      // 👤 update user
      if (userId) {
        await db.user.update({
          where: { clerkId: userId },
          data: {
            plan,
            credits,
            customerId,
            subscriptionId,
          },
        });
      } else if (email) {
        await db.user.updateMany({
          where: { email },
          data: {
            plan,
            credits,
            customerId,
            subscriptionId,
          },
        });
      }

      // 💾 payment record
      await db.payment.create({
        data: {
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "usd",
          userId: userId || email || "unknown",
          stripeId: session.id,
        },
      });

      // 🔥 recover abandoned checkout
      await db.abandonedCheckout.updateMany({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          recovered: true,
        },
      });

      console.log(`✅ User upgraded to ${plan}`);
    }

    // =============================
    // ❌ SUBSCRIPTION CANCELLED
    // =============================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;

      await db.user.updateMany({
        where: { customerId },
        data: {
          plan: "FREE",
          subscriptionId: null,
        },
      });

      console.log("❌ Subscription cancelled");
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("❌ Webhook handler error:", error);

    return new NextResponse("Server Error", { status: 500 });
  }
}