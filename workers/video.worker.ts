import { Worker, QueueEvents, Job } from "bullmq";
import { connection } from "@/lib/redis";
import { processVideoJob } from "@/lib/workers/video.processor";

//////////////////////////////////////////////////
// 🚀 VIDEO WORKER (PRODUCTION SaaS READY)
//////////////////////////////////////////////////

// ⚠️ منع إعادة إنشاء worker في hot reload (Next.js dev issue)
const globalForWorker = globalThis as unknown as {
  videoWorker?: Worker;
  queueEvents?: QueueEvents;
};

//////////////////////////////////////////////////
// 🧠 WORKER INSTANCE (SINGLETON SAFE)
//////////////////////////////////////////////////

export const videoWorker =
  globalForWorker.videoWorker ??
  new Worker(
    "video-queue",

    async (job: Job) => {
      const { jobId } = job.data;

      console.log(`🚀 [START] job=${jobId} attempt=${job.attemptsMade}`);

      try {
        const result = await processVideoJob(jobId, {
          priority: job.opts.priority,
          attemptsMade: job.attemptsMade,
        });

        console.log(`✅ [SUCCESS] job=${jobId}`);

        return result;
      } catch (error) {
        console.error(`❌ [FAIL] job=${jobId}`, error);
        throw error; // important for BullMQ retry system
      }
    },

    {
      connection,

      // ⚡ concurrency (scaling factor)
      concurrency: 3,

      // 🔒 prevent stuck jobs
      lockDuration: 5 * 60 * 1000, // 5 minutes

      // 💾 memory cleanup (production safe)
      removeOnComplete: {
        count: 200,
      },
      removeOnFail: {
        count: 1000,
      },

      // 🔁 retry backoff strategy
      settings: {
        backoffStrategy: (attemptsMade: number) => {
          return Math.min(2000 * 2 ** attemptsMade, 15000);
        },
      },
    }
  );

globalForWorker.videoWorker = videoWorker;

//////////////////////////////////////////////////
// 📡 QUEUE EVENTS (OBSERVABILITY LAYER)
//////////////////////////////////////////////////

export const queueEvents =
  globalForWorker.queueEvents ??
  new QueueEvents("video-queue", {
    connection,
  });

globalForWorker.queueEvents = queueEvents;

queueEvents.on("completed", ({ jobId }) => {
  console.log(`🎉 COMPLETED: ${jobId}`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`🔥 FAILED: ${jobId} → ${failedReason}`);
});

queueEvents.on("progress", ({ jobId, data }) => {
  console.log(`📊 PROGRESS: ${jobId}`, data);
});

//////////////////////////////////////////////////
// 🧠 WORKER LIFECYCLE EVENTS
//////////////////////////////////////////////////

videoWorker.on("error", (err) => {
  console.error("💀 WORKER ERROR:", err);
});

videoWorker.on("stalled", (jobId) => {
  console.warn(`⚠️ STALLED JOB: ${jobId}`);
});

videoWorker.on("ioredis:close", () => {
  console.error("🔌 Redis connection closed");
});

videoWorker.on("ready", () => {
  console.log("🟢 Worker ready");
});

//////////////////////////////////////////////////
// 🚀 BOOT LOG
//////////////////////////////////////////////////

console.log("🎬 VIDEO WORKER INITIALIZED");
console.log("⚡ Concurrency: 3");
console.log("🔥 Queue: video-queue");