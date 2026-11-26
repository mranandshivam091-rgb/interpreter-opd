import type {
  Provider,
  TranslateRequest,
  TranslateResult,
  TranscribeTranslateRequest,
  TranscribeTranslateResult,
} from "./provider.js";

// "latest" alias instead of a pinned version: Google deprecates dated model
// names over time (gemini-2.5-flash was already retired for new API keys).
// Flash-Lite is plenty for short translation/transcription prompts and is
// cheaper/faster than full Flash.
const MODEL = "gemini-flash-lite-latest";
const TIMEOUT_MS = 10_000;
const NUMBERS_AND_DRUGS_RULE =
  "Keep medicine names and numbers (dosage, frequency, days) exactly as spoken — do not translate, round, or reformat them.";
const SCRIPT_RULE =
  "Write the translation in the target language's native script (Devanagari for Hindi, Tamil script for Tamil) — never in Roman/Latin transliteration.";

const LANG_NAMES: Record<string, string> = {
  hi: "Hindi",
  bho: "Hindi", // Bhojpuri speech is recognized as Hindi text; translate it as Hindi
  ta: "Tamil",
  en: "English",
};

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(parts: GeminiPart[], jsonMode: boolean): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
      },
      body: JSON.stringify({
        contents: [{ parts }],
        ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseTranscriptionJson(raw: string): { original?: string; translated?: string } {
  const cleaned = raw.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return { original: parsed.original, translated: parsed.translated };
  } catch {
    return {};
  }
}

export const geminiProvider: Provider = {
  name: "gemini",

  async translate({ text, from, to }: TranslateRequest): Promise<TranslateResult> {
    const fromName = LANG_NAMES[from] ?? from;
    const toName = LANG_NAMES[to] ?? to;
    const prompt =
      `Translate the following ${fromName} sentence into ${toName}. ` +
      `This is a doctor-patient conversation in an Indian hospital. ${NUMBERS_AND_DRUGS_RULE} ${SCRIPT_RULE} ` +
      `Reply with ONLY the ${toName} translation, nothing else.\n\n${text}`;

    const translatedText = await callGemini([{ text: prompt }], false);
    return { translatedText };
  },

  async transcribeAndTranslate({
    audioBase64,
    mimeType,
    toLang,
  }: TranscribeTranslateRequest): Promise<TranscribeTranslateResult> {
    const toName = LANG_NAMES[toLang] ?? toLang;
    const prompt =
      `Listen to this audio clip from a doctor-patient conversation in an Indian hospital. ` +
      `The speaker may mix languages (e.g. Tamil and English, or Hindi and English) in the same ` +
      `sentence — transcribe exactly what is said, in whatever language(s) it was spoken in. ` +
      `${NUMBERS_AND_DRUGS_RULE} Then translate that transcription into ${toName}, again ` +
      `keeping medicine names and numbers exactly as spoken. ${SCRIPT_RULE} ` +
      `Respond with ONLY a JSON object of the exact shape {"original": "...", "translated": "..."}, ` +
      `no markdown formatting, no extra text.`;

    const raw = await callGemini([{ text: prompt }, { inlineData: { mimeType, data: audioBase64 } }], true);
    const { original, translated } = parseTranscriptionJson(raw);
    if (!original || !translated) {
      throw new Error("Gemini returned an incomplete transcription");
    }
    return { originalText: original, translatedText: translated };
  },
};
