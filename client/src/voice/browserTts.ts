// Thin wrapper around the browser's speechSynthesis (text-to-speech).
export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: string): void {
  if (!isTtsSupported() || !text) return;
  window.speechSynthesis.cancel(); // don't let utterances queue up and overlap
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}
