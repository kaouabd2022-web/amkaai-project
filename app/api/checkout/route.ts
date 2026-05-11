import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 📦 safe JSON parse
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { plan } = body;

    if (!plan) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );
    }

    // 💳 env check (IMPORTANT)
    const proUrl = process.env.LEMON_SQUEEZY_PRO_URL;
    const premiumUrl = process.env.LEMON_SQUEEZY_PREMIUM_URL;

    if (!proUrl || !premiumUrl) {
      return NextResponse.json(
        { error: "Missing checkout URLs in env" },
        { status: 500 }
      );
    }

    const checkoutUrl =
      plan === "premium" ? premiumUrl : proUrl;

    // 💾 save (non-blocking)
    db.abandonedCheckout.create({
      data: {
        userId,
        email: user.email,
        checkoutUrl,
        plan,
      },
    }).catch(console.warn);

    // ✅ ALWAYS JSON RESPONSE
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