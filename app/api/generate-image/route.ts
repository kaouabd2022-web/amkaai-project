import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { useCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    // 🔐 AUTH
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 GET USER
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 📦 PARSE BODY
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { prompt } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Valid prompt is required" },
        { status: 400 }
      );
    }

    // 💸 USE CREDITS (centralized system)
    let creditResult;
    try {
      creditResult = await useCredits(user.id, "image");
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Not enough credits" },
        { status: 403 }
      );
    }

    // 🎯 AI IMAGE GENERATION (placeholder)
    // 👉 هنا تربط OpenAI / Stability / Replicate
    const imageUrl = "https://example.com/image.png";

    // 💾 OPTIONAL: SAVE IMAGE
    await db.image.create({
      data: {
        url: imageUrl,
        prompt,
        userId: user.id,
      },
    }).catch(() => {});

    // 🚀 RESPONSE
    return NextResponse.json({
      success: true,
      url: imageUrl,
      creditsUsed: creditResult.cost,
      remainingCredits: creditResult.remainingCredits,
    });

  } catch (error: any) {
    console.error("🔥 IMAGE API FATAL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal server error during image generation",
      },
      { status: 500 }
    );
  }
}