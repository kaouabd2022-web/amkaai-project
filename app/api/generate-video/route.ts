import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { addJob } from "@/lib/queue";

const VIDEO_COST = 30;

export async function POST(req: Request) {
  try {
    // 🔐 Auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👤 Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 💳 Check credits
    if (user.credits < VIDEO_COST) {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 403 }
      );
    }

    // 📦 Parse request
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 📊 Create usage (for tracking + refund system)
    const usage = await db.usage.create({
      data: {
        userId: user.id,
        type: "video",
        cost: VIDEO_COST,
        status: "PENDING",
      },
    });

    // 🚀 Create video job (queue system)
    const job = await db.videoJob.create({
      data: {
        userId: user.id,
        prompt,
        usageId: usage.id,
        status: "PENDING",
      },
    });

    // 💸 Deduct credits immediately (safe atomic)
    await db.user.update({
      where: { id: user.id },
      data: {
        credits: {
          decrement: VIDEO_COST,
        },
      },
    });

    // 🧠 Push job to worker queue
    addJob({
      id: job.id,
      type: "video",
    });

    // 📤 Return job info (NOT final video yet)
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: "PENDING",
      message: "Video is being generated",
    });

  } catch (error) {
    console.error("🔥 Video API error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}