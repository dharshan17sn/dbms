import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Send friend request
router.post("/request", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { receiverId } = req.body;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Check if already friends or request exists
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, receiverId },
                    { requesterId: receiverId, receiverId: userId }
                ]
            }
        });

        if (existing) {
            res.status(400).json({ error: "Friend request already exists or you are already friends" });
            return;
        }

        const friendship = await prisma.friendship.create({
            data: {
                requesterId: userId,
                receiverId,
                status: "PENDING"
            },
            include: {
                requester: { select: { id: true, displayName: true, email: true } },
                receiver: { select: { id: true, displayName: true, email: true } }
            }
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "FRIEND_REQUEST",
                payload: {
                    friendshipId: friendship.id,
                    requesterId: userId,
                    requesterName: friendship.requester.displayName
                }
            }
        });

        res.status(201).json(friendship);
    } catch (error) {
        console.error("Send friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get user's friends
router.get("/", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: "ACCEPTED" },
                    { receiverId: userId, status: "ACCEPTED" }
                ]
            },
            include: {
                requester: { select: { id: true, displayName: true, email: true, profile: true } },
                receiver: { select: { id: true, displayName: true, email: true, profile: true } }
            }
        });

        const friends = friendships.map((f: any) =>
            f.requesterId === userId ? f.receiver : f.requester
        );

        res.json(friends);
    } catch (error) {
        console.error("Get friends error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get pending friend requests
router.get("/requests", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const requests = await prisma.friendship.findMany({
            where: {
                receiverId: userId,
                status: "PENDING"
            },
            include: {
                requester: { select: { id: true, displayName: true, email: true, profile: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(requests);
    } catch (error) {
        console.error("Get friend requests error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Accept friend request
router.put("/requests/:id/accept", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const friendship = await prisma.friendship.findUnique({
            where: { id },
            include: { requester: { select: { displayName: true } } }
        });

        if (!friendship || friendship.receiverId !== userId) {
            res.status(404).json({ error: "Friend request not found" });
            return;
        }

        const updated = await prisma.friendship.update({
            where: { id },
            data: { status: "ACCEPTED" }
        });

        // Create notification for requester
        await prisma.notification.create({
            data: {
                userId: friendship.requesterId,
                type: "FRIEND_REQUEST_ACCEPTED",
                payload: {
                    friendshipId: id,
                    acceptedBy: userId
                }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Accept friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Reject friend request
router.put("/requests/:id/reject", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const friendship = await prisma.friendship.findUnique({
            where: { id }
        });

        if (!friendship || friendship.receiverId !== userId) {
            res.status(404).json({ error: "Friend request not found" });
            return;
        }

        await prisma.friendship.update({
            where: { id },
            data: { status: "REJECTED" }
        });

        res.json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Reject friend request error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
