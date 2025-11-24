import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authenticateToken } from "./middlewares/auth.middleware";

import docsRoutes from "./routes/docs.routes";
import projectsRoutes from "./routes/projects.routes";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import chatRoutes from "./routes/chat.routes";
import placementsRoutes from "./routes/placements.routes";
import friendsRoutes from "./routes/friends.routes";
import ideasRoutes from "./routes/ideas.routes";
import notificationsRoutes from "./routes/notifications.routes";

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
app.use("/api/projects", authenticateToken, projectsRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/chat", authenticateToken, chatRoutes);
app.use("/api/placements", authenticateToken, placementsRoutes);
app.use("/api/friends", authenticateToken, friendsRoutes);
app.use("/api/ideas", authenticateToken, ideasRoutes);
app.use("/api/notifications", authenticateToken, notificationsRoutes);

export default app;
