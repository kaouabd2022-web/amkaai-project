import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 🧠 Simple visitor system (SaaS-style starter)
// لاحقًا يمكن ترقيته إلى Vercel Analytics أو PostHog

let cachedVisitors = 1850;

function simulateGrowth() {
  // زيادة بسيطة تعطي إحساس live traffic
  const randomBoost = Math.floor(Math.random() * 5); // 0 - 4
  cachedVisitors += randomBoost;
}

export async function GET() {
  try {
    simulateGrowth();

    return NextResponse.json({
      visitors: cachedVisitors,
      online: Math.floor(cachedVisitors * 0.03), // نسبة المستخدمين النشطين
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      visitors: 0,
      online: 0,
    });
  }
}