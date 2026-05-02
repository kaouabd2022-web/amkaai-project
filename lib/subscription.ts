import { prisma } from "@/lib/prisma";

export async function isProUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return user?.plan === "PRO";
}