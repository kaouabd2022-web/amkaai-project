import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // 🔐 حماية
    const { userId } = await await auth(); // ✅ FIX
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (userEmail !== adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📊 جلب البيانات
    const payments = await db.manualPayment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // 🧹 تنظيف البيانات
    const formatted = payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      email: p.user?.email || "N/A",
      plan: p.plan,
      amount: p.amount,
      status: p.status,
      screenshotUrl: p.screenshotUrl,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error("❌ Fetch payments error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}