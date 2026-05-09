import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // =========================
    // IMPORT INSIDE FUNCTION
    // =========================
    const { db } = await import("@/lib/db");
    const { sendAbandonedEmail } = await import("@/lib/email");

    // =========================
    // 30 MINUTES LIMIT
    // =========================
    const limit = new Date(Date.now() - 1000 * 60 * 30);

    // =========================
    // GET ABANDONED CHECKOUTS
    // =========================
    const list = await db.abandonedCheckout.findMany({
      where: {
        createdAt: {
          lt: limit,
        },
        recovered: false,
      },
    });

    let sent = 0;

    // =========================
    // LOOP
    // =========================
    for (const item of list ?? []) {
      try {
        if (!item.email || !item.checkoutUrl) {
          continue;
        }

        // =========================
        // SEND EMAIL
        // =========================
        await sendAbandonedEmail({
          email: item.email,
          checkoutUrl: item.checkoutUrl,
        });

        // =========================
        // UPDATE STATUS
        // =========================
        await db.abandonedCheckout.update({
          where: {
            id: item.id,
          },
          data: {
            recovered: true,
          },
        });

        sent++;

      } catch (innerError) {
        console.error("Failed item:", item.id, innerError);
      }
    }

    // =========================
    // SUCCESS
    // =========================
    return NextResponse.json({
      success: true,
      sent,
    });

  } catch (error) {
    console.error("Abandoned cron error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}