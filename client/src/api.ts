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
