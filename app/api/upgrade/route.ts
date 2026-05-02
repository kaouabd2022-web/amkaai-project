import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId } = await auth();

    // 🔒 تأكيد تسجيل الدخول
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 👑 ترقية المستخدم إلى PRO + إضافة credits
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: {
        plan: "PRO",
        credits: {
          increment: 50, // 🎁 bonus PRO
        },
      },
    });

    // 🚀 رفع أولوية كل المهام القديمة
    await db.videoJob.updateMany({
      where: {
        userId,
        status: {
          in: ["pending", "processing"],
        },
      },
      data: {
        priority: 1, // PRO priority
      },
    });

    return NextResponse.json({
      success: true,
      message: "User upgraded to PRO successfully",
      user: {
        plan: updatedUser.plan,
        credits: updatedUser.credits,
      },
    });

  } catch (error) {
    console.error("UPGRADE ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}