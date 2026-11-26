import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { healthRouter } from "./routes/health.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api", healthRouter);

// In the production image, the built frontend sits next to dist/ at client/.
// In local dev (tsx, no client build yet) that folder won't exist — skip static hosting then.
const clientDir = path.resolve(__dirname, "../client");
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Interpreter server listening on http://localhost:${port}`);
});
