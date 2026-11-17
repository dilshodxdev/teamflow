import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createApp } from "./app.js";
const backend = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
dotenv.config({ path: path.join(backend, ".env") });
const databasePath = path.resolve(
  backend,
  process.env.DATABASE_PATH || "data/teamflow.db",
);
const port = Number(process.env.PORT || 4000);
const ttl = Number(process.env.SESSION_TTL_HOURS || 24);
if (
  !Number.isFinite(ttl) ||
  ttl <= 0 ||
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535
)
  throw new Error("Invalid server configuration");
const { app } = createApp({
  databasePath,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  secure: process.env.NODE_ENV === "production",
  sessionTtlHours: ttl,
});
app.listen(port, () =>
  console.log(`TeamFlow backend listening on http://localhost:${port}`),
);
