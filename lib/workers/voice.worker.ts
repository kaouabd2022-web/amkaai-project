import { db } from "@/lib/db";

export async function processVoiceJob(jobId: string) {
  const job = await db.voiceJob.findUnique({
    where: { id: jobId },
  });

  if (!job) return;

  // simulate AI
  await new Promise((r) => setTimeout(r, 3000));

  await db.voiceJob.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      resultUrl: `https://cdn.yoursaas.com/audio/${Date.now()}.mp3`,
    },
  });

  console.log("🎤 Voice done:", jobId);
}