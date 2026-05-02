import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await await auth();

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: 15,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: userId,
      order_description: "PRO PLAN",
      success_url: "http://localhost:3000/dashboard",
      cancel_url: "http://localhost:3000/pricing",
    }),
  });

  const data = await res.json();

  return NextResponse.json({
    url: data.invoice_url,
  });
}