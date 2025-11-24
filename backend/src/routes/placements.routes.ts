import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get all job posts
router.get("/", async (req, res) => {
    try {
        const jobs = await prisma.jobPost.findMany({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } }
                ]
            },
            include: {
                company: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { postedAt: "desc" }
        });
        res.json(jobs);
    } catch (error) {
        console.error("Get jobs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create job post (PLACEMENT_ADMIN only)
router.post("/", async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    // @ts-ignore
    const userRole = req.user?.role;

    if (!userId || userRole !== "PLACEMENT_ADMIN") {
        res.status(403).json({ error: "Only placement coordinators can create job posts" });
        return;
    }

    try {
        const { title, description, companyName, minCgpa, requiresVerifiedProject, expiresAt } = req.body;

        if (!title || !companyName) {
            res.status(400).json({ error: "Title and company name are required" });
            return;
        }

        // Create or find company
        let company = await prisma.company.findFirst({
            where: { name: companyName }
        });

        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: companyName,
                    createdBy: userId
                }
            });
        }

        const jobPost = await prisma.jobPost.create({
            data: {
                title,
                description,
                companyId: company.id,
                minCgpa: minCgpa ? parseFloat(minCgpa) : null,
                requiresVerifiedProject: requiresVerifiedProject || false,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            },
            include: { company: true }
        });

        res.status(201).json(jobPost);
    } catch (error) {
        console.error("Create job error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update job post (PLACEMENT_ADMIN only)
router.put("/:id", async (req, res) => {
    // @ts-ignore
    const userRole = req.user?.role;

    if (userRole !== "PLACEMENT_ADMIN") {
        res.status(403).json({ error: "Only placement coordinators can update job posts" });
        return;
    }

    try {
        const { id } = req.params;
        const { title, description, minCgpa, requiresVerifiedProject, expiresAt } = req.body;

        const jobPost = await prisma.jobPost.update({
            where: { id },
            data: {
                title,
                description,
                minCgpa: minCgpa ? parseFloat(minCgpa) : null,
                requiresVerifiedProject,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            },
            include: { company: true }
        });

        res.json(jobPost);
    } catch (error) {
        console.error("Update job error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete job post (PLACEMENT_ADMIN only)
router.delete("/:id", async (req, res) => {
    // @ts-ignore
    const userRole = req.user?.role;

    if (userRole !== "PLACEMENT_ADMIN") {
        res.status(403).json({ error: "Only placement coordinators can delete job posts" });
        return;
    }

    try {
        const { id } = req.params;
        await prisma.jobPost.delete({ where: { id } });
        res.json({ message: "Job post deleted successfully" });
    } catch (error) {
        console.error("Delete job error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
