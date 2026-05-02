import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text required" },
        { status: 400 }
      );
    }

    // 👤 get user (FIX: clerkId not id)
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    // 🆕 create user if not exists
    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
        },
      });
    }

    // 🔢 voice usage count
    const count = await db.voice.count({
      where: { userId: userId },
    });

    // ⚠️ FREE limit check (schema uses "plan", not isPro)
    if (user.plan !== "PRO" && count >= 5) {
      return NextResponse.json(
        { error: "Free limit reached. Upgrade to Pro." },
        { status: 403 }
      );
    }

    // 🎤 ElevenLabs API
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.log("ELEVEN ERROR:", err);

      return NextResponse.json(
        { error: "Voice generation failed" },
        { status: 500 }
      );
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // 💾 save voice
    await db.voice.create({
      data: {
        text,
        url: audioUrl,
        userId: userId,
      },
    });

    return NextResponse.json({
      audio: audioUrl,
    });

  } catch (error) {
    console.error("VOICE ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}