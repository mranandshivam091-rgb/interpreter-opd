import type { Provider } from "./provider.js";

// Sarvam AI support lands in a later step. This stub keeps the Provider
// interface ready to swap in — only reachable if SARVAM_API_KEY is set.
export const sarvamProvider: Provider = {
  name: "sarvam",
  async translate() {
    throw new Error("Sarvam provider is not implemented yet");
  },
  async transcribeAndTranslate() {
    throw new Error("Sarvam provider is not implemented yet");
  },
};
