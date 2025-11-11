// src/db/prismaClient.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

prisma.$on("error", (e) => {
  console.error("Prisma client error:", e);
});

export default prisma;
