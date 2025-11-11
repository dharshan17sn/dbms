import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import docsRoutes from "./routes/docs.routes";
import projectsRoutes from "./routes/projects.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("tiny"));

// health
app.get("/", (_req, res) => res.json({ ok: true, message: "Backend running ✅" }));

// docs (place near the top so it's easy to find)
app.use("/docs", docsRoutes);

// mount other APIs
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);

export default app;
