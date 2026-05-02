import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { jobId } = await req.json();

    const job = await db.videoJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    // ❌ cancelled state
    if (job.status === "cancelled") {
      return NextResponse.json({ status: "cancelled" });
    }

    // 📊 Queue calculation
    const jobsAhead = await db.videoJob.findMany({
      where: {
        status: { in: ["pending", "processing"] },
        OR: [
          { priority: { gt: job.priority } },
          {
            priority: job.priority,
            createdAt: { lt: job.createdAt },
          },
        ],
      },
      select: { priority: true },
    });

    const position = jobsAhead.length;

    let estimatedSeconds = 0;
    for (const j of jobsAhead) {
      estimatedSeconds += j.priority === 1 ? 15 : 25;
    }

    // ✅ DONE STATE (FIXED)
    if (job.status === "completed") {
      return NextResponse.json({
        status: "done",
        video: job.resultUrl, // ✅ FIXED (was videoUrl)
        position: 0,
        estimatedTime: 0,
      });
    }

    // ⏳ Not its turn yet
    const nextJob = await db.videoJob.findFirst({
      where: { status: "pending" },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    if (nextJob?.id !== job.id) {
      return NextResponse.json({
        status: job.status,
        position,
        estimatedTime: estimatedSeconds,
      });
    }

    // 🔄 Start processing
    await db.videoJob.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    // 🎬 Replicate settings
    const steps = 30; // simplified (remove quality dependency)

    const output = await replicate.run(
      "cerspense/zeroscope-v2-xl",
      {
        input: {
          prompt: job.prompt || "",
          num_inference_steps: steps,
          guidance_scale: 7.5,
        },
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;

    // 💰 cost logic (simple)
    const cost = job.priority === 1 ? 3 : 5;

    await db.$transaction([
      db.video.create({
        data: {
          url: videoUrl,
          prompt: job.prompt || "",
          userId: job.userId,
        },
      }),

      db.user.update({
        where: { clerkId: job.userId },
        data: {
          credits: { decrement: cost },
        },
      }),

      db.videoJob.update({
        where: { id: job.id },
        data: {
          status: "completed", // ✅ FIXED (was done)
          resultUrl: videoUrl, // ✅ FIXED (was videoUrl)
        },
      }),
    ]);

    return NextResponse.json({
      status: "done",
      video: videoUrl,
      position: 0,
      estimatedTime: 0,
    });

  } catch (error) {
    console.error("STATUS ERROR:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}