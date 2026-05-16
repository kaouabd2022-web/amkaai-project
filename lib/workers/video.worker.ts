import { db } from "@/lib/db";

const MAX_RETRIES = 3;
const BASE_DELAY = 2000;
const PROCESS_TIMEOUT = 10 * 60 * 1000;

//////////////////////////////////////////////////
// 🚀 MAIN PROCESSOR (PRODUCTION SAFE)
//////////////////////////////////////////////////

export async function processVideoJob(jobId: string) {
  try {
    // 🔒 1. STRONG ATOMIC LOCK (anti double execution)
    const locked = await db.videoJob.updateMany({
      where: {
        id: jobId,
        status: "PENDING",
      },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    if (locked.count === 0) {
      console.log("⛔ Skipped (already processed/locked):", jobId);
      return;
    }

    const job = await db.videoJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return;

    console.log(`🎬 START JOB: ${jobId}`);

    // ⏱ 2. AI GENERATION (SAFE TIMEOUT)
    const resultUrl = await withTimeout(
      generateVideo(job.prompt),
      PROCESS_TIMEOUT
    );

    // 💾 3. SUCCESS TRANSACTION (CONSISTENCY SAFE)
    await db.$transaction(async (tx) => {
      await tx.videoJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          resultUrl,
          finishedAt: new Date(),
          progress: 100,
        },
      });

      if (job.usageId) {
        await tx.usage.update({
          where: { id: job.usageId },
          data: {
            status: "COMPLETED",
          },
        });
      }
    });

    console.log(`✅ DONE: ${jobId}`);
  } catch (error) {
    console.error("🔥 WORKER ERROR:", error);
    await handleFailure(jobId, error);
  }
}

//////////////////////////////////////////////////
// 🤖 AI LAYER (SWAPPABLE PROVIDERS)
//////////////////////////////////////////////////

async function generateVideo(prompt: string): Promise<string> {
  // 🔥 لاحقاً:
  // - Replicate (zeroscope / runway)
  // - Kling AI
  // - Pika Labs
  // - RunwayML

  await new Promise((r) => setTimeout(r, 4000));

  return `https://cdn.yoursaas.com/videos/${Date.now()}.mp4`;
}

//////////////////////////////////////////////////
// ⏱ TIMEOUT WRAPPER (SAFE)
//////////////////////////////////////////////////

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), ms)
    ),
  ]);
}

//////////////////////////////////////////////////
// ❌ FAILURE HANDLER (NO RECURSION LOOP RISK)
//////////////////////////////////////////////////

async function handleFailure(jobId: string, error: any) {
  const job = await db.videoJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return;

  const currentAttempts = job.attempts ?? 0;

  const canRetry = currentAttempts < MAX_RETRIES;

  if (canRetry) {
    const nextAttempt = currentAttempts + 1;

    const delay = Math.min(
      BASE_DELAY * 2 ** currentAttempts,
      15000
    );

    console.log(
      `🔁 RETRY ${jobId} (${nextAttempt}/${MAX_RETRIES}) in ${delay}ms`
    );

    // 🔥 SAFE REQUEUE (no recursive call stack risk)
    setTimeout(async () => {
      try {
        await db.videoJob.update({
          where: { id: jobId },
          data: {
            status: "PENDING",
            attempts: nextAttempt,
            error: String(error),
          },
        });

        // re-trigger safely
        await processVideoJob(jobId);
      } catch (err) {
        console.error("Retry failed:", err);
      }
    }, delay);

    return;
  }

  // 💀 FINAL FAILURE STATE
  await db.videoJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      error: String(error),
      finishedAt: new Date(),
      progress: 0,
    },
  });

  // 💳 SAFE REFUND (ONLY FINAL FAILURE)
  if (job.usageId) {
    await db.usage.update({
      where: { id: job.usageId },
      data: {
        status: "FAILED",
        refunded: true,
      },
    });
  }

  console.error(`❌ FINAL FAIL: ${jobId}`);
}