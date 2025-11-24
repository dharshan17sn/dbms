import { Router } from "express";
import prisma from "../db/prismaClient";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

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
router.put("/profile", upload.single("resume"), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        const { bio, skills, cgpa, researchPapers, gitLink, usn, branch, gender, phone, currentYear } = req.body;
        let resumeLink = req.body.resumeLink;

        // @ts-ignore
        if (req.file) {
            // @ts-ignore
            resumeLink = `/uploads/${req.file.filename}`;
        }

        // Parse skills and researchPapers if they are strings (from FormData)
        let parsedSkills = skills;
        if (typeof skills === "string") {
            try {
                parsedSkills = JSON.parse(skills);
            } catch (e) {
                parsedSkills = skills.split(",").map((s: string) => s.trim());
            }
        }

        let parsedResearchPapers = researchPapers;
        if (typeof researchPapers === "string") {
            try {
                parsedResearchPapers = JSON.parse(researchPapers);
            } catch (e) {
                parsedResearchPapers = [researchPapers];
            }
        }

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                bio,
                skills: parsedSkills,
                resumeLink,
                gitLink,
                usn,
                branch,
                gender,
                phone,
                currentYear,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
                researchPapers: parsedResearchPapers,
            },
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
