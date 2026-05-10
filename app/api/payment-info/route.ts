import { NextResponse } from "next/server";

export async function GET() {
  const rip = process.env.BARIDIMOB_RIP;
  const usdt = process.env.USDT_TRC20_ADDRESS;

  return NextResponse.json(
    {
      rip: rip ?? "",
      usdt: usdt ?? "",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}