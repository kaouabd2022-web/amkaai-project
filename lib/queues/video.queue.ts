import { Queue } from "bullmq";
import { connection } from "@/lib/redis";

export const videoQueue = new Queue("video-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});