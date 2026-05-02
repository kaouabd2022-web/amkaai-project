import { db } from "@/lib/db";
import { NextResponse } from "next/server";
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
    const { paymentId, reason } = await req.json();

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
    if (payment.status === "REJECTED") {
      return NextResponse.json({ error: "Already rejected" }, { status: 400 });
    }

    if (payment.status === "APPROVED") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // 🔥 Transaction (audit + notification)
    const result = await db.$transaction(async (tx) => {
      // 🔄 Update payment
      const updatedPayment = await tx.manualPayment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          rejectedBy: userEmail || "admin",
          rejectReason: reason || "No reason provided",
          updatedAt: new Date(),
        },
      });

      // 🔔 Notification user
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: "❌ Payment Rejected",
          message: reason
            ? `Your payment was rejected: ${reason}`
            : "Your payment was rejected. Please try again or contact support.",
        },
      });

      return updatedPayment;
    });

    return NextResponse.json({
      ok: true,
      status: result.status,
      rejectedBy: userEmail,
    });

  } catch (error) {
    console.error("❌ Reject error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}