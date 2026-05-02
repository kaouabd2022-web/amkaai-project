import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Tesseract from "tesseract.js";

export async function POST(req: Request) {
  const { paymentId } = await req.json();

  const payment = await db.manualPayment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || !payment.screenshotUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // 🧠 OCR
    const result = await Tesseract.recognize(
      payment.screenshotUrl,
      "eng"
    );

    const text = result.data.text.toLowerCase();

    // 🔍 تحقق من RIP + مبلغ
    const rip = process.env.BARIDIMOB_RIP?.toLowerCase() || "";
    const amount = payment.amount.toString();

    const hasRip = rip && text.includes(rip.slice(0, 6));
    const hasAmount = text.includes(amount);

    // 🔁 منع تكرار نفس الصورة (بسيط)
    const existing = await db.manualPayment.findFirst({
      where: {
        screenshotUrl: payment.screenshotUrl,
        NOT: { id: paymentId },
      },
    });

    if (existing) {
      await db.manualPayment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          aiScore: 0,
          verified: false,
        },
      });

      return NextResponse.json({ error: "Duplicate screenshot" });
    }

    // 🧠 score
    let score = 0;
    if (hasRip) score += 0.5;
    if (hasAmount) score += 0.5;

    let status = "PENDING";

    if (score >= 0.8) status = "APPROVED";
    if (score < 0.5) status = "REJECTED";

    // 💾 تحديث الدفع
    await db.manualPayment.update({
      where: { id: paymentId },
      data: {
        aiScore: score,
        verified: score >= 0.8,
        status,
      },
    });

    // ⚡ تفعيل تلقائي
    if (status === "APPROVED") {
      await db.user.update({
        where: { clerkId: payment.userId },
        data: {
          plan: payment.plan,
          credits: payment.plan === "PRO" ? 150 : 500,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      score,
      status,
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}