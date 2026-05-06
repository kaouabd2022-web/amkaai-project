import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle({
  apiKey: process.env.PADDLE_API_KEY!,
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

    // ✅ إنشاء رابط صفحة إدارة الاشتراك (Customer Portal)
    const portalSession = await paddle.customers.createPortalSession(
      user.customerId,
      {
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      }
    );

    return NextResponse.json({
      url: portalSession.url,
    });

  } catch (error) {
    console.error("Paddle billing portal error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}