import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// =========================
// VERIFY SIGNATURE
// =========================
function verifySignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) return false;

  const digest = crypto
    .createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return digest === signature;
}

// =========================
// MAIN HANDLER
// =========================
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");

    // 🔐 Verify request
    if (!verifySignature(rawBody, signature)) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    const eventName = event?.meta?.event_name;
    const eventId = event?.meta?.event_id; // مهم لمنع التكرار
    const data = event?.data?.attributes;

    console.log("📩 Event:", eventName);

    // =========================
    // 🛑 IDEMPOTENCY CHECK
    // =========================
    const existing = await db.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      console.log("⚠️ Duplicate event ignored:", eventId);
      return NextResponse.json({ ok: true });
    }

    // خزّن الحدث
    await db.webhookEvent.create({
      data: { eventId },
    });

    // =========================
    // 🎯 EXTRACT USER
    // =========================
    const userId = data?.custom_data?.userId;
    const plan = data?.custom_data?.plan || "pro";

    // =========================
    // SWITCH EVENTS
    // =========================
    switch (eventName) {

      // =========================
      // 💳 PAYMENT SUCCESS
      // =========================
      case "order_created":
      case "subscription_created": {
        if (!userId) break;

        await db.user.update({
          where: { clerkId: userId },
          data: {
            isPro: true,
            plan,
            lemonCustomerId: data?.customer_id || null,
            lemonSubscriptionId: data?.subscription_id || null,
          },
        });

        console.log("✅ User upgraded:", userId);
        break;
      }

      // =========================
      // 🔄 SUBSCRIPTION UPDATE
      // =========================
      case "subscription_updated":
      case "subscription_resumed": {
        if (!userId) break;

        await db.user.update({
          where: { clerkId: userId },
          data: {
            isPro: data?.status === "active",
          },
        });

        console.log("🔄 Subscription updated");
        break;
      }

      // =========================
      // ❌ CANCEL / EXPIRE
      // =========================
      case "subscription_cancelled":
      case "subscription_expired": {
        if (!userId) break;

        await db.user.update({
          where: { clerkId: userId },
          data: {
            isPro: false,
            plan: "free",
          },
        });

        console.log("❌ Subscription ended:", userId);
        break;
      }

      // =========================
      // ⚠️ PAYMENT FAILED
      // =========================
      case "subscription_payment_failed": {
        console.log("⚠️ Payment failed");
        break;
      }

      default:
        console.log("ℹ️ Unhandled:", eventName);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🔥 Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}