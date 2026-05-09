import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

// =========================
// SAFE INIT (no crash build)
// =========================
const paddleApiKey = process.env.PADDLE_API_KEY || "";

const paddle = new Paddle(paddleApiKey);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email || !user?.customerId) {
      return NextResponse.json(
        { error: "User missing data" },
        { status: 400 }
      );
    }

    // =========================
    // FIX: proper env names
    // =========================
    const priceId =
      plan === "pro"
        ? process.env.PADDLE_PRICE_PRO
        : process.env.PADDLE_PRICE_PREMIUM;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing PRICE_ID" },
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
    // FIX: safe checkout URL
    // =========================
    const checkoutUrl =
      (transaction as any)?.checkout?.url ||
      (transaction as any)?.checkout_url ||
      (transaction as any)?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Checkout URL not found" },
        { status: 500 }
      );
    }

    // =========================
    // DB (safe)
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
    } catch (e) {
      console.log("DB ignored:", e);
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}