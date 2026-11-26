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

export function startListening(
  lang: string,
  onResult: (result: SttResult) => void,
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
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const alt = event.results[event.results.length - 1][0];
    // Chrome often reports confidence as 0 for final results; treat that as "unknown, trust it".
    onResult({ transcript: alt.transcript.trim(), confidence: alt.confidence || 1 });
  };
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = onEnd;

  recognition.start();
  return { stop: () => recognition.stop() };
}
