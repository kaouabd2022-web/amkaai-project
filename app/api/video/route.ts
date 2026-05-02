import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { db } from "@/lib/db";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt } = await req.json();

    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          credits: 10,
        },
      });
    }

    if (user.credits < 2) {
      return new NextResponse("No credits", { status: 403 });
    }

    const output = await replicate.run(
      "cerspense/zeroscope-v2-xl",
      {
        input: { prompt },
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;

    await db.$transaction([
      db.video.create({
        data: {
          url: videoUrl,
          prompt,
          userId,
        },
      }),
      db.user.update({
        where: { clerkId: userId },
        data: {
          credits: { decrement: 2 },
        },
      }),
    ]);

    return NextResponse.json({ video: videoUrl });

  } catch (err) {
    console.log(err);
    return new NextResponse("Error", { status: 500 });
  }
}