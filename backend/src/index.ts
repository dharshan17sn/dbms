import config from "./config";
import app from "./app";
import prisma from "./db/prismaClient";
import { startJobCleanup } from "./jobs/cleanup";
import { seedRoles } from "./utils/seeder";

async function main() {
  await prisma.$connect();

  // Seed roles on startup
  await seedRoles();

  // Start cron jobs
  startJobCleanup();

  app.listen(config.port, () => {
    const baseUrl = `http://localhost:${config.port}`;
    console.log("\n🚀 Server is up and running!");
    console.log(`🟢 API Base:        ${baseUrl}`);
    console.log(`📘 Swagger Docs:    ${baseUrl}/docs`);
    console.log(`🔐 Auth Routes:     ${baseUrl}/api/auth/signup`);
    console.log(`📂 Project Routes:  ${baseUrl}/api/projects\n`);
    console.log("✨ Press Ctrl+Click on any URL above to open it in your browser.\n");
  });
}
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
