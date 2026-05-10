import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

if (!process.env.PADDLE_API_KEY) {
  throw new Error("Missing PADDLE_API_KEY");
}

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 🔒 Clerk auth (FIXED)
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👤 get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email || !user.customerId) {
      return NextResponse.json(
        { error: "User not ready" },
        { status: 400 }
      );
    }

    // 📦 body
    const { plan } = await req.json();

    if (!plan) {
      return NextResponse.json(
        { error: "Missing plan" },
        { status: 400 }
      );
    }

    // 💳 price
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

    // 🚀 create transaction
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

    // ⚡ FIX: safer checkout url extraction
    const url =
      (transaction as any)?.checkout?.url ||
      (transaction as any)?.checkoutUrl;

    if (!url) {
      return NextResponse.json(
        { error: "Checkout URL not generated" },
        { status: 500 }
      );
    }

    // 💾 save abandoned checkout (safe)
    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl: url,
          transactionId: transaction.id,
        },
      });
    } catch (err) {
      console.log("Abandoned checkout ignored:", err);
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("🔥 CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}