import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 🔐 Auth
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 📦 body
    const body = await req.json().catch(() => null);

    if (!body?.plan) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );
    }

    const { plan } = body;

    // 💳 Lemon Squeezy checkout URLs
    const checkoutUrl =
      plan === "premium"
        ? process.env.LEMON_SQUEEZY_PREMIUM_URL
        : process.env.LEMON_SQUEEZY_PRO_URL;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Missing checkout URL in env" },
        { status: 500 }
      );
    }

    // 💾 save abandoned checkout
    db.abandonedCheckout
      .create({
        data: {
          userId,
          email: user.email,
          checkoutUrl,
          plan,
        },
      })
      .catch((err) => {
        console.warn("Abandoned checkout error:", err);
      });

    // 🚀 return checkout link
    return NextResponse.json({
      url: checkoutUrl,
    });
  } catch (error) {
    console.error("🔥 Checkout error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}