import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      plan,
      checkoutUrl,
      email,
      step,
    } = body;

    if (!checkoutUrl || !plan) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // =========================
    // SAVE ABANDONED CHECKOUT
    // =========================
    await db.abandonedCheckout.create({
      data: {
        userId,
        email: email || null,
        plan,
        checkoutUrl,
        step: step || "checkout_started",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Abandoned checkout saved",
    });

  } catch (error: any) {
    console.error("ABANDONED ERROR:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal error",
      },
      { status: 500 }
    );
  }
}

// =========================
// OPTIONAL GET (admin/debug)
// =========================
export async function GET() {
  try {
    const data = await db.abandonedCheckout.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}