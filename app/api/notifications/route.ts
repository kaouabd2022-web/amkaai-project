import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    // 🔒 Unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      ok: true,
      data: notifications,
    });

  } catch (error) {
    console.error("❌ Notifications error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}