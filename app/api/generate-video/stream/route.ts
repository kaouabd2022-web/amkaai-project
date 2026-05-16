import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response("jobId required", { status: 400 });
  }

  // 🔥 SSE headers
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        while (true) {
          const job = await db.videoJob.findUnique({
            where: { id: jobId },
            select: {
              status: true,
              resultUrl: true,
              error: true,
              updatedAt: true,
            },
          });

          if (!job) {
            send({ status: "not_found" });
            break;
          }

          // 📊 PROGRESS LOGIC (simple but effective)
          let progress = 0;

          if (job.status === "PENDING") progress = 5;
          if (job.status === "PROCESSING") progress = 40;
          if (job.status === "COMPLETED") progress = 100;
          if (job.status === "FAILED") progress = 100;

          // 📤 SEND UPDATE
          send({
            status: job.status.toLowerCase(),
            progress,
            video: job.resultUrl ?? null,
            error: job.error ?? null,
          });

          // 🛑 STOP CONDITIONS
          if (job.status === "COMPLETED" || job.status === "FAILED") {
            break;
          }

          // ⏱ wait before next update
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (err) {
        send({
          status: "error",
          message: String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}