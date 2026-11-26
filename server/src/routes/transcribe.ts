import { Router } from "express";
import { getActiveProvider, resolveProviderName } from "../providers/provider.js";

export const transcribeRouter = Router();

transcribeRouter.post("/transcribe-translate", async (req, res) => {
  const providerName = resolveProviderName();
  if (providerName === "none") {
    // Demo mode never calls this route (it uses the browser recognizer instead),
    // but guard it anyway in case something hits it directly.
    res.status(200).json({ provider: "none" });
    return;
  }

  const { audioBase64, mimeType, toLang } = req.body ?? {};
  if (typeof audioBase64 !== "string" || typeof mimeType !== "string" || typeof toLang !== "string") {
    res.status(400).json({ error: "audioBase64, mimeType and toLang are required" });
    return;
  }

  try {
    const result = await getActiveProvider().transcribeAndTranslate({ audioBase64, mimeType, toLang });
    res.status(200).json({
      provider: providerName,
      originalText: result.originalText,
      translatedText: result.translatedText,
    });
  } catch (err) {
    console.error(`[transcribe-translate] ${providerName} provider failed:`, err);
    res.status(502).json({ provider: providerName, error: "Transcription failed, please try again" });
  }
});
