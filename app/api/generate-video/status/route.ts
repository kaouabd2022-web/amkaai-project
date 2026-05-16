import { NextResponse } from "next/server";
import { db } from "@/lib/db";

//////////////////////////////////////////////////
// 🚀 VIDEO JOB STATUS API (SAAS READY)
//////////////////////////////////////////////////

export async function POST(req: Request) {
  try {
    // 📥 INPUT SAFE PARSING
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const jobId = body?.jobId;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId required" },
        { status: 400 }
      );
    }

    // 🔎 FETCH JOB (minimal + optimized)
    const job = await db.videoJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        priority: true,
        createdAt: true,
        resultUrl: true,
        error: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // ❌ CANCELLED STATE
    if (job.status === "CANCELLED") {
      return NextResponse.json({
        status: "cancelled",
        video: null,
        position: null,
        estimatedTime: 0,
      });
    }

    // ✅ COMPLETED STATE (fast exit)
    if (job.status === "COMPLETED") {
      return NextResponse.json({
        status: "done",
        video: job.resultUrl,
        position: 0,
        estimatedTime: 0,
      });
    }

    //////////////////////////////////////////////////
    // ⚙️ QUEUE POSITION (optimized ranking system)
    //////////////////////////////////////////////////

    const position = await db.videoJob.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },

        // jobs ahead of current job
        OR: [
          {
            priority: { gt: job.priority },
          },
          {
            priority: job.priority,
            createdAt: { lt: job.createdAt },
          },
        ],
      },
    });

    //////////////////////////////////////////////////
    // ⏱ ESTIMATION MODEL (realistic SaaS model)
    //////////////////////////////////////////////////

    const baseTimePerJob =
      job.priority >= 8
        ? 12 // high priority fast lane
        : job.priority >= 4
        ? 20
        : 30; // normal queue

    const estimatedTime = position * baseTimePerJob;

    //////////////////////////////////////////////////
    // 🔄 PENDING STATE
    //////////////////////////////////////////////////

    if (job.status === "PENDING") {
      return NextResponse.json({
        status: "pending",
        video: null,
        position,
        estimatedTime,
      });
    }

    //////////////////////////////////////////////////
    // ⚙️ PROCESSING STATE
    //////////////////////////////////////////////////

    if (job.status === "PROCESSING") {
      return NextResponse.json({
        status: "processing",
        video: null,
        position,
        estimatedTime: Math.max(estimatedTime, 5),
      });
    }

    //////////////////////////////////////////////////
    // 💀 FAILED STATE (important UX fix)
    //////////////////////////////////////////////////

    if (job.status === "FAILED") {
      return NextResponse.json({
        status: "failed",
        video: null,
        position: null,
        estimatedTime: 0,
        error: job.error ?? "Generation failed",
      });
    }

    //////////////////////////////////////////////////
    // 🧠 FALLBACK (future-proof)
    //////////////////////////////////////////////////

    return NextResponse.json({
      status: job.status.toLowerCase(),
      video: job.resultUrl ?? null,
      position,
      estimatedTime,
    });

  } catch (error) {
    console.error("STATUS API ERROR:", error);

    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}