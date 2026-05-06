import { PrismaClient } from "@prisma/client";

declare global {
  // 🧠 نخلي Prisma global باش ما يتكرر في dev
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // useful أثناء التطوير
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}