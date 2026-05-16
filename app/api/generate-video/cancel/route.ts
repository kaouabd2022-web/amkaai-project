import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { jobId } = await req.json();

    const job = await db.videoJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    // 🔐 حماية
    if (job.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (job.status === "done") {
      return new NextResponse("Already finished", { status: 400 });
    }

    await db.videoJob.update({
      where: { id: jobId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true });

  } catch (e) {
    console.log(e);
    return new NextResponse("Server error", { status: 500 });
  }
}