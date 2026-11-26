import { useEffect, useState } from "react";
import { fetchHealth, type ProviderName } from "./api";
import { StartScreen } from "./screens/StartScreen";
import { ConversationScreen } from "./screens/ConversationScreen";
import { DemoBanner } from "./components/DemoBanner";

type Screen = "start" | "conversation";

export default function App() {
  const [provider, setProvider] = useState<ProviderName | null>(null);
  const [screen, setScreen] = useState<Screen>("start");
  const [patientLang, setPatientLang] = useState<"hi" | "bho">("hi");
  const [doctorLang, setDoctorLang] = useState<"ta" | "en">("ta");

  useEffect(() => {
    // If the health check fails entirely (server down), treat it the same as
    // "none" so the UI never crashes or blocks on a missing backend.
    fetchHealth()
      .then((health) => setProvider(health.provider))
      .catch(() => setProvider("none"));
  }, []);

  if (screen === "conversation") {
    return (
      <ConversationScreen patientLang={patientLang} doctorLang={doctorLang} onBack={() => setScreen("start")} />
    );
  }

  return (
    <>
      {provider === "none" && <DemoBanner />}
      <StartScreen
        provider={provider}
        patientLang={patientLang}
        doctorLang={doctorLang}
        onPatientLangChange={setPatientLang}
        onDoctorLangChange={setDoctorLang}
        onStart={() => setScreen("conversation")}
      />
    </>
  );
}
