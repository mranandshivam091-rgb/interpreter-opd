import { geminiProvider } from "./gemini.js";
import { sarvamProvider } from "./sarvam.js";
import { noneProvider } from "./none.js";

// Picks which speech/translation backend is active, based on which API key is present.
// Order matters: Sarvam first, then Gemini, then "none" (browser-only demo mode).
export type ProviderName = "sarvam" | "gemini" | "none";

export interface TranslateRequest {
  text: string;
  from: string;
  to: string;
}

export interface TranslateResult {
  translatedText: string;
}

export interface TranscribeTranslateRequest {
  audioBase64: string;
  mimeType: string;
  toLang: string;
}

export interface TranscribeTranslateResult {
  originalText: string;
  translatedText: string;
}

export interface Provider {
  name: ProviderName;
  translate(req: TranslateRequest): Promise<TranslateResult>;
  transcribeAndTranslate(req: TranscribeTranslateRequest): Promise<TranscribeTranslateResult>;
}

export function resolveProviderName(): ProviderName {
  if (process.env.SARVAM_API_KEY) return "sarvam";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "none";
}

export function getActiveProvider(): Provider {
  const name = resolveProviderName();
  if (name === "sarvam") return sarvamProvider;
  if (name === "gemini") return geminiProvider;
  return noneProvider;
}
