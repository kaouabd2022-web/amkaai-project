import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.count();

  const payments = await db.payment.findMany();
  const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const proUsers = await db.user.count({
    where: { plan: "PRO" },
  });

  const premiumUsers = await db.user.count({
    where: { plan: "PREMIUM" },
  });

  return NextResponse.json({
    users,
    revenue,
    proUsers,
    premiumUsers,
  });
}