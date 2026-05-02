import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  // ✅ الدفع تم
  if (body.payment_status === "finished") {
    const userId = body.order_id;

    await db.user.update({
      where: { clerkId: userId },
      data: {
        plan: "PRO",
        credits: 100,
      },
    });

    console.log("💰 Crypto payment success");
  }

  return NextResponse.json({ ok: true });
}