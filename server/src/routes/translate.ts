import { Router } from "express";
import { getActiveProvider, resolveProviderName } from "../providers/provider.js";

export const translateRouter = Router();

translateRouter.post("/translate", async (req, res) => {
  const providerName = resolveProviderName();
  if (providerName === "none") {
    // No key configured — the frontend falls back to its own phrase map.
    res.status(200).json({ provider: "none" });
    return;
  }

  const { text, from, to } = req.body ?? {};
  if (typeof text !== "string" || typeof from !== "string" || typeof to !== "string") {
    res.status(400).json({ error: "text, from and to are required" });
    return;
  }

  try {
    const result = await getActiveProvider().translate({ text, from, to });
    res.status(200).json({ provider: providerName, translatedText: result.translatedText });
  } catch (err) {
    console.error(`[translate] ${providerName} provider failed:`, err);
    res.status(502).json({ provider: providerName, error: "Translation failed, please try again" });
  }
});
