import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { plan, method, amount, currency, screenshot } = body;

    if (!plan || !method || !amount) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    await db.manualPayment.create({
      data: {
        userId,
        plan,
        method,
        amount,
        currency: currency || "DZD",
        screenshotUrl: screenshot || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment uploaded successfully",
    });

  } catch (error) {
    console.error("UPLOAD PAYMENT ERROR:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}