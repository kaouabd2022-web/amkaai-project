import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

// =========================
// ENV CHECK
// =========================
if (!process.env.PADDLE_API_KEY) {
  throw new Error("Missing PADDLE_API_KEY");
}

// =========================
// INIT PADDLE
// =========================
const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY,
  environment:
    process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export async function POST(req: Request) {
  try {
    // =========================
    // AUTH
    // =========================
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // =========================
    // GET USER
    // =========================
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.customerId) {
      return NextResponse.json(
        { error: "Missing Paddle customerId" },
        { status: 400 }
      );
    }

    // =========================
    // BODY (PLAN)
    // =========================
    const body = await req.json();
    const plan = body?.plan;

    if (!plan) {
      return NextResponse.json(
        { error: "Missing plan" },
        { status: 400 }
      );
    }

    // =========================
    // PRICE ID
    // =========================
    const priceId =
      plan === "premium"
        ? process.env.PADDLE_PREMIUM_KEY
        : process.env.PADDLE_PRO_KEY;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 500 }
      );
    }

    // =========================
    // CREATE TRANSACTION
    // =========================
    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],

      customerId: user.customerId,

      customData: {
        userId,
        plan,
      },
    });

    // =========================
    // GET CHECKOUT URL
    // =========================
    const checkoutUrl =
      transaction?.checkout?.url ||
      (transaction as any)?.checkoutUrl;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Checkout URL not generated" },
        { status: 500 }
      );
    }

    // =========================
    // SAVE ABANDONED CHECKOUT
    // =========================
    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl,
          transactionId: transaction.id,
        },
      });
    } catch (err) {
      console.log("DB warning ignored:", err);
    }

    // =========================
    // RETURN
    // =========================
    return NextResponse.json({
      url: checkoutUrl,
    });

  } catch (error: any) {
    console.error("🔥 CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}