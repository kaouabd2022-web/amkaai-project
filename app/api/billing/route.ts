import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 🔐 Clerk auth (correct for Next.js)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 get user from DB
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 💳 Lemon Squeezy check
    if (!user.lemonCustomerId) {
      return NextResponse.json(
        { error: "No Lemon Squeezy customer found" },
        { status: 400 }
      );
    }

    // 📦 safe body parsing (optional future use)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const plan = body?.plan || "pro";

    // 🌐 redirect or dashboard URL
    const url =
      plan === "premium"
        ? `${process.env.NEXT_PUBLIC_URL}/dashboard?plan=premium`
        : `${process.env.NEXT_PUBLIC_URL}/dashboard?plan=pro`;

    return NextResponse.json({
      url,
      customerId: user.lemonCustomerId,
      plan,
    });

  } catch (error) {
    console.error("❌ Billing API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}