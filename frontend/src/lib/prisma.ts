import { PrismaClient } from "@prisma/client";

declare global {
  // Next.js のホットリロード対策
  // @ts-expect-ignore
  var __prisma: PrismaClient;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  // @ts-expect-ignore
  global.__prisma = prisma;
}
