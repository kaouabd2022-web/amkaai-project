import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAbandonedEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {

    const limit = new Date(Date.now() - 1000 * 60 * 30);

    const list = await db.abandonedCheckout.findMany({
      where: {
        createdAt: {
          lt: limit,
        },
        recovered: false,
      },
    });

    let sent = 0;

    for (const item of list) {
      try {

        if (!item.email || !item.checkoutUrl) {
          continue;
        }

        await db.abandonedCheckout.update({
          where: {
            id: item.id,
          },
          data: {
            recovered: true,
          },
        });

        await sendAbandonedEmail({
          email: item.email,
          checkoutUrl: item.checkoutUrl,
        });

        sent++;

      } catch (innerError) {
        console.error("Failed item:", item.id, innerError);
      }
    }

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