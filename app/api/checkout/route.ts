import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 🔐 AUTH
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 GET USER FROM DB
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 📦 SAFE BODY PARSE
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { plan } = body;

    // 🎯 VALIDATION
    if (!plan || !["pro", "premium"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // 🔗 ENV CHECK
    const proUrl = process.env.LEMON_SQUEEZY_PRO_URL;
    const premiumUrl = process.env.LEMON_SQUEEZY_PREMIUM_URL;

    if (!proUrl || !premiumUrl) {
      console.error("❌ Missing Lemon Squeezy URLs");
      return NextResponse.json(
        { error: "Server misconfigured (missing checkout URLs)" },
        { status: 500 }
      );
    }

    // 🎯 SELECT URL
    const checkoutUrl =
      plan === "premium" ? premiumUrl : proUrl;

    // 💾 SAVE ABANDONED CHECKOUT (NON-BLOCKING)
    db.abandonedCheckout.create({
      data: {
        userId: user.id, // ✅ FIX مهم
        email: user.email,
        checkoutUrl,
        plan,
      },
    }).catch((err) => {
      console.warn("⚠️ Abandoned checkout save failed:", err);
    });

    // 🚀 RESPONSE
    return NextResponse.json({
      url: checkoutUrl,
    });

  } catch (error: any) {
    console.error("🔥 CHECKOUT FATAL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal server error during checkout",
      },
      { status: 500 }
    );
  }
}