import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: { plan: "PRO" },
    create: {
      clerkId: userId,
      plan: "PRO",
    },
  });

  return NextResponse.json({ message: "Upgraded to PRO" });
}