import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { plan, screenshotUrl, rip, method, currency } = body;

    if (!plan || !screenshotUrl || !method || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amount = plan === "PRO" ? 1500 : 2500;

    const payment = await db.manualPayment.create({
      data: {
        userId,

        plan,

        method,       // USDT | BARIDIMOB
        currency,     // DZD | USDT

        amount,

        screenshotUrl,

        rip: rip || null, // optional

        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Manual payment error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}