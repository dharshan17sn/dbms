import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get Dashboard Stats
router.get("/stats", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const projectCount = await prisma.project.count({
            where: { ownerId: userId },
        });

        const applicationCount = await prisma.jobApplication.count({
            where: { applicantId: userId },
        });

        res.json({
            projectCount,
            applicationCount,
            // Add more stats as needed
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Profile
router.get("/profile", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: { user: { select: { displayName: true, email: true, role: true } } },
        });

        if (!profile) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }

        res.json(profile);
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update Profile
router.put("/profile", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const { bio, skills, resumeLink, cgpa, researchPapers } = req.body;

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                bio,
                skills,
                resumeLink,
                cgpa,
                researchPapers,
            },
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
