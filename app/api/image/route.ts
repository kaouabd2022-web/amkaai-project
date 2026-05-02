import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt required" },
        { status: 400 }
      );
    }

    // 👤 USER
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          credits: 10,
          plan: "FREE",
        },
      });
    }

    // =========================
    // 🔥 LIMIT (CREDITS)
    // =========================
    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "limit reached" },
        { status: 403 }
      );
    }

    // =========================
    // 🤖 OPENAI
    // =========================
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.data?.[0]?.url) {
      console.error("❌ OpenAI Error:", data);

      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    const imageUrl = data.data[0].url;

    // =========================
    // 🔥 WATERMARK (FREE ONLY)
    // =========================
    let finalImage = imageUrl;

    if (user.plan === "FREE") {
      finalImage = `https://images.weserv.nl/?url=${encodeURIComponent(
        imageUrl
      )}&w=1024&h=1024&text=AMKAAI`;
    }

    // =========================
    // 💾 SAVE (TRANSACTION)
    // =========================
    await db.$transaction([
      db.image.create({
        data: {
          url: finalImage,
          prompt,
          userId: user.clerkId,
        },
      }),

      db.user.update({
        where: { clerkId: userId },
        data: {
          credits: { decrement: 1 },
        },
      }),

      db.usage.create({
        data: {
          type: "image",
          cost: 1,
          userId: user.clerkId,
        },
      }),
    ]);

    // =========================
    // 🚀 RESPONSE
    // =========================
    return NextResponse.json({
      image: finalImage,
      plan: user.plan,
      creditsLeft: user.credits - 1,
    });

  } catch (error) {
    console.error("❌ IMAGE ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}