import { db } from "@/lib/db";

export async function processImageJob(jobId: string) {
  const job = await db.imageJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return;

  // simulate AI
  await new Promise((r) => setTimeout(r, 3000));

  await db.imageJob.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      resultUrl: `https://cdn.yoursaas.com/images/${Date.now()}.png`,
    },
  });

  console.log("🖼 Image done:", jobId);
}