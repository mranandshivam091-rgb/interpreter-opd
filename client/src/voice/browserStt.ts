// Thin wrapper around the browser's SpeechRecognition (speech-to-text).
export interface SttResult {
  transcript: string;
  confidence: number;
}

export interface SttHandle {
  stop: () => void;
}

export function isSttSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// continuous=true so a short pause mid-sentence doesn't end the session —
// only an explicit stop() (or the browser's own long-silence timeout) does.
// Results across the whole session are accumulated and delivered once, at
// the end, as a single combined transcript.
export function startListening(
  lang: string,
  onFinal: (result: SttResult) => void,
  onEnd: () => void,
  onError?: (message: string) => void,
): SttHandle | null {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) {
    onError?.("not-supported");
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let combinedTranscript = "";
  let lastConfidence = 1;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const alt = event.results[i][0];
      const piece = alt.transcript.trim();
      if (!piece) continue;
      combinedTranscript = combinedTranscript ? `${combinedTranscript} ${piece}` : piece;
      // Chrome often reports confidence as 0 for final results; treat that as "unknown, trust it".
      lastConfidence = alt.confidence || 1;
    }
  };
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => {
    onFinal({ transcript: combinedTranscript.trim(), confidence: lastConfidence });
    onEnd();
  };

  recognition.start();
  return { stop: () => recognition.stop() };
}
