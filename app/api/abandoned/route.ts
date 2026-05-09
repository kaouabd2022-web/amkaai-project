import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ❌ لا Prisma
// ❌ لا DB
// ❌ لا Email
// فقط endpoint آمن للبناء

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Abandoned route temporarily disabled for build stability",
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
  });
}