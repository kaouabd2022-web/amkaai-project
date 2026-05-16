import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🎯 PLAN CONFIG
const PLAN_CREDITS = {
  pro: 120,
  premium: 320,
};

// ⚠️ مهم: فقط events معينة
const ALLOWED_EVENTS = [
  "order_created",
  "subscription_created",
  "subscription_updated",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📩 Webhook received");

    const eventName = body?.meta?.event_name;
    const eventId = body?.meta?.event_id;

    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // ❌ تجاهل events غير مهمة
    if (!ALLOWED_EVENTS.includes(eventName)) {
      return NextResponse.json({ ignored: true });
    }

    // 🔒 IDMPOTENCY (منع التكرار)
    const existingEvent = await db.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      console.log("⚠️ Duplicate webhook ignored:", eventId);
      return NextResponse.json({ duplicate: true });
    }

    // 👤 USER EMAIL
    const email = body?.data?.attributes?.user_email;

    if (!email) {
      return NextResponse.json(
        { error: "Missing user email" },
        { status: 400 }
      );
    }

    // 🔎 FIND USER
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 🎯 VARIANT → PLAN
    const variantId = body?.data?.attributes?.variant_id;

    const PRO_VARIANT_ID = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    const PREMIUM_VARIANT_ID = process.env.LEMON_SQUEEZY_PREMIUM_VARIANT_ID;

    let plan: "pro" | "premium" | null = null;

    if (variantId == PRO_VARIANT_ID) plan = "pro";
    if (variantId == PREMIUM_VARIANT_ID) plan = "premium";

    if (!plan) {
      console.log("⚠️ Unknown variant:", variantId);
      return NextResponse.json(
        { error: "Unknown plan" },
        { status: 400 }
      );
    }

    const credits = PLAN_CREDITS[plan];

    // 📦 OPTIONAL: Lemon IDs
    const lemonCustomerId =
      body?.data?.attributes?.customer_id?.toString() || null;

    const lemonSubscriptionId =
      body?.data?.attributes?.subscription_id?.toString() || null;

    // 💳 UPDATE USER (atomic)
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          plan,
          isPro: true,
          credits: credits, // ⚠️ replace or change to increment if needed
          lemonCustomerId,
          lemonSubscriptionId,
        },
      }),

      // 🧾 SAVE EVENT (idempotency)
      db.webhookEvent.create({
        data: {
          eventId,
        },
      }),
    ]);

    console.log(
      `✅ ${email} upgraded → ${plan} (${credits} credits)`
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 WEBHOOK FATAL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal webhook processing error",
      },
      { status: 500 }
    );
  }
}