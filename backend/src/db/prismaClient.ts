import { PrismaClient } from "@prisma/client";
import config from "../config";

const dbUrl = config.databaseUrl;
const maskedUrl = dbUrl.replace(/:[^:@]*@/, ":***@");

console.log(`🔌 Initializing Prisma Client with URL: ${maskedUrl}`);

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

prisma.$on("error", (e) => {
  console.error("Prisma client error:", e);
});

export default prisma;
