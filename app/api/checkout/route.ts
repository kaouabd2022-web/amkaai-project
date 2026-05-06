import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Paddle SDK (Billing v2)
import { Paddle } from "@paddle/paddle-node-sdk";

if (!process.env.PADDLE_API_KEY) {
  throw new Error("Missing PADDLE_API_KEY");
}

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY,
});

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("USER_ID:", userId);

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

    console.log("PADDLE_PRICE_ID:", priceId);

    // ✅ إنشاء Checkout Link عبر Paddle
    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],

      customer: {
        email: user.email,
      },

      // Paddle handles success/cancel internally
      customData: {
        userId,
      },

      checkout: {
        successUrl: `${baseUrl}/dashboard`,
        cancelUrl: `${baseUrl}/ai-image`,
      },
    });

    if (!transaction?.checkout?.url) {
      console.error("Paddle transaction error:", transaction);

      return NextResponse.json(
        { error: "Paddle checkout creation failed" },
        { status: 500 }
      );
    }

    // DB (نفس فكرتك القديمة - لا نكسر السيرفر إذا فشل)
    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl: transaction.checkout.url,
          stripeSessionId: transaction.id, // نحتفظ به كـ reference فقط
        },
      });
    } catch (dbError) {
      console.log("DB error ignored:", dbError);
    }

    return NextResponse.json({
      url: transaction.checkout.url,
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