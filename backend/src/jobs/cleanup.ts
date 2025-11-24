import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Run every hour to delete expired job posts
export const startJobCleanup = () => {
    cron.schedule("0 * * * *", async () => {
        try {
            const result = await prisma.jobPost.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });

            if (result.count > 0) {
                console.log(`Deleted ${result.count} expired job post(s)`);
            }
        } catch (error) {
            console.error("Job cleanup error:", error);
        }
    });

    console.log("Job cleanup cron started (runs hourly)");
};
