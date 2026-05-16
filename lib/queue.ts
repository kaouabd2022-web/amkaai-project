type JobType = "video" | "image" | "voice";

export type Job = {
  id: string;
  type: JobType;
  retries: number;
  priority: number;
  createdAt: number;
  lastError?: string;
};

// =====================================
// 🧠 QUEUE STORAGE
// =====================================

const queue: Job[] = [];

// 🔒 execution safety locks
let isProcessing = false;
let activeJobs = 0;

// ⚡ SaaS tuning
const MAX_RETRIES = 3;
const CONCURRENCY = 2;
const MAX_QUEUE_SIZE = 500;

// =====================================
// 🚀 ADD JOB (SAFE)
// =====================================

export function addJob(input: {
  id: string;
  type: JobType;
  priority?: number;
}) {
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.warn("⚠️ Queue full, rejecting job:", input.id);
    return;
  }

  const job: Job = {
    id: input.id,
    type: input.type,
    retries: 0,
    priority: input.priority ?? 0,
    createdAt: Date.now(),
  };

  queue.push(job);

  sortQueue();
  trigger();
}

// =====================================
// ⚡ TRIGGER PROCESSING
// =====================================

function trigger() {
  if (isProcessing) return;

  isProcessing = true;
  void processQueue();
}

// =====================================
// 🔄 MAIN LOOP (SAFE CONCURRENCY)
// =====================================

async function processQueue() {
  try {
    while (queue.length > 0) {
      if (activeJobs >= CONCURRENCY) {
        await sleep(100);
        continue;
      }

      const job = queue.shift();
      if (!job) continue;

      activeJobs++;

      executeJob(job).finally(() => {
        activeJobs--;
      });
    }
  } finally {
    isProcessing = false;
  }
}

// =====================================
// 🧠 EXECUTE JOB
// =====================================

async function executeJob(job: Job) {
  const start = Date.now();

  console.log(
    `🚀 START job=${job.id} type=${job.type} retry=${job.retries}`
  );

  try {
    await handleJob(job);

    console.log(
      `✅ DONE job=${job.id} in ${Date.now() - start}ms`
    );
  } catch (err: any) {
    console.error(`❌ FAIL job=${job.id}`, err?.message);

    await handleFailure(job, err);
  }
}

// =====================================
// 🔧 JOB HANDLER
// =====================================

async function handleJob(job: Job) {
  switch (job.type) {
    case "video": {
      const { processVideoJob } = await import("./workers/video.worker");
      return processVideoJob(job.id);
    }

    case "image": {
      const { processImageJob } = await import("./workers/image.worker");
      return processImageJob(job.id);
    }

    case "voice": {
      const { processVoiceJob } = await import("./workers/voice.worker");
      return processVoiceJob(job.id);
    }

    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

// =====================================
// ❌ FAILURE HANDLER (PRODUCTION SAFE)
// =====================================

async function handleFailure(job: Job, err: any) {
  const nextRetry = job.retries + 1;

  job.lastError = err?.message ?? "unknown error";

  // 🔁 retry allowed
  if (nextRetry <= MAX_RETRIES) {
    const delayMs = backoff(nextRetry);

    console.log(
      `🔁 RETRY job=${job.id} ${nextRetry}/${MAX_RETRIES} in ${delayMs}ms`
    );

    setTimeout(() => {
      queue.push({
        ...job,
        retries: nextRetry,
      });

      sortQueue();
      trigger();
    }, delayMs);

    return;
  }

  // 💀 final failure
  console.error(`💀 FINAL FAIL job=${job.id}`);

  await markJobFailed(job);
}

// =====================================
// 💀 FINAL FAILURE HOOK
// =====================================

async function markJobFailed(job: Job) {
  try {
    const { db } = await import("@/lib/db");

    await db.videoJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: job.lastError ?? "unknown",
        finishedAt: new Date(),
      },
    });

    await db.usage.updateMany({
      where: { referenceId: job.id },
      data: {
        status: "FAILED",
        refunded: true,
      },
    });
  } catch (e) {
    console.error("⚠️ DB failure handling job fail:", e);
  }
}

// =====================================
// 📊 PRIORITY SORTING
// =====================================

function sortQueue() {
  queue.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    return a.createdAt - b.createdAt;
  });
}

// =====================================
// ⏱ BACKOFF STRATEGY
// =====================================

function backoff(retry: number) {
  return Math.min(1000 * 2 ** retry, 30000);
}

// =====================================
// ⏱ UTIL
// =====================================

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// =====================================
// 📡 DEBUG (DEV ONLY)
// =====================================

if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    console.log(
      `📊 Queue size=${queue.length} active=${activeJobs}`
    );
  }, 5000);
}