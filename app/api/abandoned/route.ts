import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      sent: 0,
      message: "Abandoned route disabled for build safety",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}