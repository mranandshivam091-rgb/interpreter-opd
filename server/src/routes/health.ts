import { Router } from "express";
import { resolveProviderName } from "../providers/provider.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, provider: resolveProviderName() });
});
