// src/routes/auth.routes.ts
import { Router } from "express";

const router = Router();

router.post("/signup", (req, res) => {
  res.status(201).json({ message: "Signup route placeholder ✅" });
});

router.post("/login", (req, res) => {
  res.status(200).json({ message: "Login route placeholder ✅" });
});

export default router;
