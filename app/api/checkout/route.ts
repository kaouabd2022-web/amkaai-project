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

export async function POST() {
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
        { error: "User not found in DB" },
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

    const priceId = process.env.PADDLE_PRICE_ID;
    const baseUrl = process.env.NEXT_PUBLIC_URL;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing PADDLE_PRICE_ID" },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_URL" },
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
      },
    });

    // =========================
    // Save Checkout (non-blocking)
    // =========================
    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl: `${baseUrl}/dashboard`,
          transactionId: transaction.id, // ✔️ FIXED HERE
        },
      });
    } catch (dbError) {
      console.log("DB error ignored:", dbError);
    }

    // =========================
    // Response
    // =========================
    return NextResponse.json({
      url: `${baseUrl}/dashboard`,
    });

  } catch (error: any) {
    console.error("🔥 FULL PADDLE CHECKOUT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}