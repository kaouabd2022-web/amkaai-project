import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("🔥 PADDLE WEBHOOK HIT");

  try {
    const event = await req.json();

    console.log("📦 Event Type:", event.event_type);

    // =========================
    // 💰 PAYMENT COMPLETED
    // =========================
    if (event.event_type === "transaction.completed") {
      const data = event.data;

      const email = data?.customer?.email;
      const userId = data?.custom_data?.userId || null;

      const productId = data?.items?.[0]?.product?.id;
      const transactionId = data?.id;
      const currency = data?.currency || "USD";
      const amount = data?.details?.totals?.grand_total
        ? Number(data.details.totals.grand_total) / 100
        : 0;

      console.log("💰 Payment successful");

      // =========================
      // 🎯 PLAN LOGIC
      // =========================
      let plan: "FREE" | "PRO" | "PREMIUM" = "FREE";
      let credits = 10;

      if (productId === process.env.PADDLE_PRODUCT_PRO) {
        plan = "PRO";
        credits = 100;
      }

      if (productId === process.env.PADDLE_PRODUCT_PREMIUM) {
        plan = "PREMIUM";
        credits = 300;
      }

      // =========================
      // 👤 UPDATE USER
      // =========================
      if (userId) {
        await db.user.update({
          where: { clerkId: userId },
          data: {
            plan,
            credits,
          },
        });
      } else if (email) {
        await db.user.updateMany({
          where: { email },
          data: {
            plan,
            credits,
          },
        });
      }

      // =========================
      // 💾 SAVE PAYMENT RECORD
      // =========================
      await db.payment.create({
        data: {
          amount,
          currency,
          userId: userId || email || "unknown",
          paddleId: transactionId, // نحتفظ بالاسم القديم في DB إن لم تغيّره
        },
      });

      console.log(`✅ User upgraded to ${plan}`);
    }

    // =========================
    // ❌ SUBSCRIPTION CANCELLED
    // =========================
    if (
      event.event_type === "subscription.canceled" ||
      event.event_type === "subscription.cancelled"
    ) {
      const email = event?.data?.customer?.email;
      const userId = event?.data?.custom_data?.userId;

      console.log("❌ Subscription cancelled");

      if (userId) {
        await db.user.update({
          where: { clerkId: userId },
          data: {
            plan: "FREE",
            credits: 10,
          },
        });
      } else if (email) {
        await db.user.updateMany({
          where: { email },
          data: {
            plan: "FREE",
            credits: 10,
          },
        });
      }
    }

    // =========================
    // 🔁 SUBSCRIPTION UPDATED
    // =========================
    if (event.event_type === "subscription.updated") {
      const data = event.data;
      const email = data?.customer?.email;

      console.log("🔄 Subscription updated");

      if (email) {
        await db.user.updateMany({
          where: { email },
          data: {
            plan: "PRO",
          },
        });
      }
    }

    // =========================
    // 🚀 TRIAL / ACTIVATION (optional)
    // =========================
    if (event.event_type === "subscription.created") {
      const email = event?.data?.customer?.email;

      console.log("🆕 Subscription created");

      if (email) {
        await db.user.updateMany({
          where: { email },
          data: {
            plan: "PRO",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Paddle webhook error:", error);
    return new NextResponse("Webhook Error", { status: 500 });
  }
}