// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in .env");
}

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const config = {
  port,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
};

export default config;
