// Picks which speech/translation backend is active, based on which API key is present.
// Order matters: Sarvam first, then Gemini, then "none" (browser-only demo mode).
export type ProviderName = "sarvam" | "gemini" | "none";

export function resolveProviderName(): ProviderName {
  if (process.env.SARVAM_API_KEY) return "sarvam";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "none";
}
