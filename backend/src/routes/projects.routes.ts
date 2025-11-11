// src/routes/projects.routes.ts
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "List all projects ✅" });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "Create new project ✅" });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: `Project details for ID ${id}` });
});

export default router;
