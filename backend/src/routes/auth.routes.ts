// src/routes/auth.routes.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prismaClient";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password || !displayName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate role if provided
    const validRoles = ["STUDENT", "MENTOR", "PLACEMENT_ADMIN"];
    const userRole = role && validRoles.includes(role) ? role : "STUDENT";

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: userRole,
        profile: {
          create: {
            skills: [],
          },
        },
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search users
router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        displayName: true,
        email: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
