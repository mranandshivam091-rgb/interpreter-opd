import { useEffect, useState } from "react";
import { fetchHealth, type ProviderName } from "./api";
import { StartScreen } from "./screens/StartScreen";
import { DemoBanner } from "./components/DemoBanner";

export default function App() {
  const [provider, setProvider] = useState<ProviderName | null>(null);

  useEffect(() => {
    // If the health check fails entirely (server down), treat it the same as
    // "none" so the UI never crashes or blocks on a missing backend.
    fetchHealth()
      .then((health) => setProvider(health.provider))
      .catch(() => setProvider("none"));
  }, []);

  return (
    <>
      {provider === "none" && <DemoBanner />}
      <StartScreen provider={provider} />
    </>
  );
}
