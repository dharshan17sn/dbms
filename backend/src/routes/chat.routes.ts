import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get Idea Messages
router.get("/ideas", async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { type: "IDEA" },
            include: { sender: { select: { id: true, displayName: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(messages);
    } catch (error) {
        console.error("Get idea messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Project Messages
router.get("/projects/:projectId", async (req, res) => {
    const { projectId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: { type: "PROJECT", projectId },
            include: { sender: { select: { id: true, displayName: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(messages);
    } catch (error) {
        console.error("Get project messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Send Message
router.post("/", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const { content, type, projectId } = req.body;

        if (!content || !type) {
            res.status(400).json({ error: "Missing content or type" });
            return;
        }

        const message = await prisma.message.create({
            data: {
                content,
                type,
                projectId: type === "PROJECT" ? projectId : undefined,
                senderId: userId,
            },
            include: { sender: { select: { id: true, displayName: true } } },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
