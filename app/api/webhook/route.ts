import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// =========================
// VERIFY SIGNATURE
// =========================
function verifySignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) return false;

  const hash = crypto
    .createHmac("sha256", process.env.PADDLE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("paddle-signature");

    // =========================
    // SECURITY CHECK
    // =========================
    if (!verifySignature(rawBody, signature)) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    console.log("📩 EVENT:", event.event_type);

    // =========================
    // SWITCH EVENTS
    // =========================
    switch (event.event_type) {
      // =========================
      // PAYMENT SUCCESS
      // =========================
      case "transaction.completed": {
        const data = event.data;

        const userId = data?.custom_data?.userId;
        const plan = data?.custom_data?.plan;

        if (!userId) break;

        await db.user.update({
          where: { clerkId: userId },
          data: {
            isPro: true,
            plan: plan || "pro",
            paddleCustomerId: data.customer_id,
            paddleSubscriptionId: data.subscription_id || null,
          },
        });

        console.log("✅ User upgraded:", userId);
        break;
      }

      // =========================
      // SUBSCRIPTION UPDATED
      // =========================
      case "subscription.updated": {
        const data = event.data;

        const customerId = data.customer_id;
        const status = data.status;

        const user = await db.user.findFirst({
          where: { paddleCustomerId: customerId },
        });

        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: {
            isPro: status === "active",
          },
        });

        console.log("🔄 Subscription updated:", user.id);
        break;
      }

      // =========================
      // SUBSCRIPTION CANCELED
      // =========================
      case "subscription.canceled": {
        const data = event.data;

        const customerId = data.customer_id;

        const user = await db.user.findFirst({
          where: { paddleCustomerId: customerId },
        });

        if (!user) break;

        await db.user.update({
          where: { id: user.id },
          data: {
            isPro: false,
            plan: "free",
          },
        });

        console.log("❌ Subscription canceled:", user.id);
        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.event_type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("🔥 WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}