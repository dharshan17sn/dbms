// src/routes/docs.routes.ts
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const router = Router();

// Load the OpenAPI YAML file
const specPath = path.resolve(process.cwd(), "openapi.yaml");

let swaggerDocument: any;
try {
  const file = fs.readFileSync(specPath, "utf8");
  swaggerDocument = yaml.load(file);
} catch (err) {
  console.error("⚠️ Failed to load openapi.yaml:", err);
  swaggerDocument = { openapi: "3.0.0", info: { title: "Missing openapi.yaml", version: "0.0.0" } };
}

// Serve Swagger UI at /docs
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Optional: expose the raw YAML at /docs/openapi.yaml
router.get("/openapi.yaml", (_req, res) => res.sendFile(specPath));

export default router;
