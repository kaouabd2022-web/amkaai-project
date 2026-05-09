import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

// =========================
// Paddle Init
// =========================
if (!process.env.PADDLE_API_KEY) {
  throw new Error("Missing PADDLE_API_KEY");
}

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "No email found" },
        { status: 400 }
      );
    }

    if (!user.customerId) {
      return NextResponse.json(
        { error: "Missing Paddle customerId" },
        { status: 400 }
      );
    }

    // =========================
    // 🔥 NEW: get plan from frontend
    // =========================
    const { plan } = await req.json();

    const priceId =
      plan === "pro"
        ? process.env.PADDLE_PRO_KEY
        : process.env.PADDLE_PREMIUM_KEY;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Paddle Price ID" },
        { status: 500 }
      );
    }

    // =========================
    // Create Paddle Transaction
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
    // Get checkout URL
    // =========================
    const checkoutUrl = transaction.checkout?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout URL" },
        { status: 500 }
      );
    }

    // =========================
    // Save abandoned checkout (safe)
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
      console.log("DB error ignored:", e);
    }

    // =========================
    // Return checkout URL
    // =========================
    return NextResponse.json({
      url: checkoutUrl,
    });

  } catch (error: any) {
    console.error("🔥 CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}