import type { Provider } from "./provider.js";

// Active when no API key is configured. The /api/translate route short-circuits
// before ever calling this, so these methods are unreachable in practice — they
// exist only so "none" satisfies the same Provider interface as the real ones.
export const noneProvider: Provider = {
  name: "none",
  async translate() {
    throw new Error("No translation provider configured");
  },
  async transcribeAndTranslate() {
    throw new Error("No translation provider configured");
  },
};
