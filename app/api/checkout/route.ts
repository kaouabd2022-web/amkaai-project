import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// ✅ لا تستعمل apiVersion الغلط
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    // ✅ تصحيح await
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧑‍💻 جلب المستخدم
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // ✅ تحقق من ENV (مهم جدا)
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    // 💳 إنشاء session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      // ✅ لازم يكون رابط الموقع وليس localhost
      success_url: "https://ai-video-site.onrender.com/dashboard",
      cancel_url: "https://ai-video-site.onrender.com/ai-image",

      metadata: {
        userId,
      },
    });

    // 💾 حفظ (اختياري، لا يكسر السيرفر)
    try {
      await db.abandonedCheckout.create({
        data: {
          userId,
          email: user.email,
          checkoutUrl: session.url!,
          stripeSessionId: session.id,
        },
      });
    } catch (dbError) {
      console.log("DB error (ignored):", dbError);
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("🔥 Checkout error:", error.message || error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}