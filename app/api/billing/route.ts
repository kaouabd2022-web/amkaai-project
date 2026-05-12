import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // ✅ FIX: لازم await
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

    // ✅ FIX: Lemon Squeezy field
    if (!user.lemonCustomerId) {
      return NextResponse.json(
        { error: "No Lemon Squeezy customer found" },
        { status: 400 }
      );
    }

    // 🎯 redirect (يمكن تغيرها لاحقًا)
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