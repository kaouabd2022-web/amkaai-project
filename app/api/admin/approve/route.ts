import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 🔒 Admin check
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

    // 📥 Body
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const payment = await db.manualPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // ❌ Already processed
    if (payment.status === "APPROVED") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    if (payment.status === "REJECTED") {
      return NextResponse.json({ error: "Already rejected" }, { status: 400 });
    }

    // 🧠 Anti-fraud
    if (payment.verified === false && payment.aiScore !== null) {
      return NextResponse.json(
        { error: "Payment not verified by AI" },
        { status: 400 }
      );
    }

    // 🎯 Credits
    const credits = payment.plan === "PRO" ? 150 : 500;

    // 💰 Currency
    const currency = payment.method === "USDT" ? "USDT" : "DZD";

    // 🔥 Transaction
    const result = await db.$transaction(async (tx) => {
      // 👤 Update user
      const updatedUser = await tx.user.update({
        where: { clerkId: payment.userId },
        data: {
          plan: payment.plan,
          credits: {
            increment: credits,
          },
        },
      });

      // 💰 سجل الدفع
      await tx.payment.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          currency,
        },
      });

      // 🔔 Notification
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: "✅ Payment Approved",
          message: `Your ${payment.plan} plan is now active 🎉`,
        },
      });

      // 🔄 Update payment
      const updatedPayment = await tx.manualPayment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          approvedBy: userEmail || "admin",
          updatedAt: new Date(),
        },
      });

      return { updatedUser, updatedPayment };
    });

    return NextResponse.json({
      ok: true,
      plan: payment.plan,
      creditsAdded: credits,
      newPlan: result.updatedUser.plan,
    });

  } catch (error) {
    console.error("❌ Approve error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}