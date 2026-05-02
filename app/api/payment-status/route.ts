import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payment = await db.manualPayment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    return NextResponse.json({ status: "NONE" });
  }

  return NextResponse.json({
    status: payment.status,
    plan: payment.plan,
    amount: payment.amount,
  });
}