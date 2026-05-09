import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ❗ مهم: لا Prisma / لا Email / لا DB هنا أبداً
export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Abandoned endpoint disabled for build stability",
  });
}

// ❗ لو كان Next يحاول جمع بيانات GET أيضاً
export async function GET() {
  return NextResponse.json({
    ok: true,
  });
}