import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { jobId } = await req.json();

  const job = await db.videoJob.findUnique({
    where: { id: jobId },
  });

  if (!job)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    status: job.status,
    url: job.resultUrl,
    error: job.error,
  });
}