import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

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
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    if (!user.customerId) {
      return NextResponse.json(
        { error: "No Paddle customer found" },
        { status: 400 }
      );
    }

    // =========================
    // 🔥 TEMP BILLING RESPONSE (SAFE BUILD)
    // =========================

    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

  } catch (error) {
    console.error("❌ Billing API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}