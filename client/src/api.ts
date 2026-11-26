export type ProviderName = "sarvam" | "gemini" | "none";

export interface HealthResponse {
  ok: boolean;
  provider: ProviderName;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error(`health check failed: ${res.status}`);
  return res.json();
}

export interface TranslateResponse {
  provider: ProviderName;
  translatedText?: string;
  error?: string;
}

const TRANSLATE_TIMEOUT_MS = 10_000;

export async function translateViaApi(text: string, from: string, to: string): Promise<TranslateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from, to }),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export interface TranscribeTranslateResponse {
  provider: ProviderName;
  originalText?: string;
  translatedText?: string;
  error?: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function transcribeAndTranslateViaApi(
  audioBlob: Blob,
  toLang: string,
): Promise<TranscribeTranslateResponse> {
  const audioBase64 = await blobToBase64(audioBlob);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const res = await fetch("/api/transcribe-translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType: audioBlob.type || "audio/webm", toLang }),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
