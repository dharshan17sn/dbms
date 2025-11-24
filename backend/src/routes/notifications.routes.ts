import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get all notifications for user
router.get("/", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        res.json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const notification = await prisma.notification.update({
            where: { id, userId },
            data: { read: true }
        });

        res.json(notification);
    } catch (error) {
        console.error("Mark notification read error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete notification
router.delete("/:id", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        await prisma.notification.delete({
            where: { id, userId }
        });

        res.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
