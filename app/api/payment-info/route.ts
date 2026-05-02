import { NextResponse } from "next/server";

export async function GET() {
  const rip = process.env.BARIDIMOB_RIP;
  const usdt = process.env.USDT_TRC20_ADDRESS;

  // ⚠️ تنبيه لو القيم غير موجودة
  if (!rip || !usdt) {
    console.warn("⚠️ Missing payment env variables");
  }

  return NextResponse.json(
    {
      rip: rip || "",
      usdt: usdt || "",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store", // 🔥 مهم
      },
    }
  );
}