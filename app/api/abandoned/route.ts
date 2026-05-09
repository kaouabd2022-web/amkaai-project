import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAbandonedEmail } from "@/lib/email";

export const runtime = "nodejs"; // 🔥 مهم جدًا لـ Vercel

export async function POST() {
  try {
    // ⏱ بعد 30 دقيقة
    const limit = new Date(Date.now() - 1000 * 60 * 30);

    // 🧾 جلب السلات غير المكتملة
    const list = await db.abandonedCheckout.findMany({
      where: {
        createdAt: { lt: limit },
        recovered: false,
      },
    });

    let sent = 0;

    // 🔥 تحسين مهم: منع crash لو DB كبير
    for (const item of list ?? []) {
      try {
        if (!item.email || !item.checkoutUrl) continue;

        // 📩 إرسال الإيميل
        await sendAbandonedEmail({
          email: item.email,
          checkoutUrl: item.checkoutUrl,
        });

        // ✅ تحديث الحالة
        await db.abandonedCheckout.update({
          where: { id: item.id },
          data: {
            recovered: true,
          },
        });

        sent++;
      } catch (innerError) {
        console.error("Failed item:", item.id, innerError);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
    });
  } catch (error) {
    console.error("Abandoned cron error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}