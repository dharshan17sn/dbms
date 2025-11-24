import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get all ideas
router.get("/", async (req, res) => {
    try {
        const ideas = await prisma.idea.findMany({
            include: {
                user: { select: { id: true, displayName: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(ideas);
    } catch (error) {
        console.error("Get ideas error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create idea
router.post("/", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { title, description } = req.body;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (!title || !description) {
        res.status(400).json({ error: "Title and description are required" });
        return;
    }

    try {
        const idea = await prisma.idea.create({
            data: {
                title,
                description,
                userId
            },
            include: {
                user: { select: { id: true, displayName: true } }
            }
        });

        res.status(201).json(idea);
    } catch (error) {
        console.error("Create idea error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get idea comments
router.get("/:id/comments", async (req, res) => {
    const { id } = req.params;

    try {
        const comments = await prisma.ideaComment.findMany({
            where: { ideaId: id },
            include: {
                user: { select: { id: true, displayName: true } }
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(comments);
    } catch (error) {
        console.error("Get idea comments error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Add comment to idea
router.post("/:id/comments", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (!content) {
        res.status(400).json({ error: "Content is required" });
        return;
    }

    try {
        const comment = await prisma.ideaComment.create({
            data: {
                ideaId: id,
                userId,
                content
            },
            include: {
                user: { select: { id: true, displayName: true } }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error("Add idea comment error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete idea
router.delete("/:id", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const idea = await prisma.idea.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!idea) {
            res.status(404).json({ error: "Idea not found" });
            return;
        }

        if (idea.userId !== userId) {
            res.status(403).json({ error: "You can only delete your own ideas" });
            return;
        }

        await prisma.idea.delete({
            where: { id }
        });

        res.json({ message: "Idea deleted successfully" });
    } catch (error) {
        console.error("Delete idea error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
