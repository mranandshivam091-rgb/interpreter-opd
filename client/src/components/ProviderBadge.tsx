import type { ProviderName } from "../api";

const LABELS: Record<ProviderName, string> = {
  sarvam: "Sarvam AI",
  gemini: "Gemini",
  none: "Browser voice (no provider)",
};

export function ProviderBadge({ provider }: { provider: ProviderName | null }) {
  const label = provider ? LABELS[provider] : "Checking…";
  return (
    <span className="provider-badge" role="status">
      {label}
    </span>
  );
}
