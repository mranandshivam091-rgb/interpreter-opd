import { useState } from "react";
import { ProviderBadge } from "../components/ProviderBadge";
import type { ProviderName } from "../api";

interface StartScreenProps {
  provider: ProviderName | null;
}

// Step 1 skeleton: buttons are inert placeholders. Conversation screen and
// navigation between screens land in step 2.
export function StartScreen({ provider }: StartScreenProps) {
  const [patientLang, setPatientLang] = useState<"hi" | "bho">("hi");
  const [doctorLang, setDoctorLang] = useState<"ta" | "en">("ta");

  return (
    <main className="start-screen">
      <h1>Interpreter</h1>
      <div className="badges">
        <ProviderBadge provider={provider} />
        <span className="badge">No recording stored</span>
      </div>

      <section className="lang-pickers" aria-label="Choose languages">
        <label>
          Patient language
          <select
            value={patientLang}
            onChange={(e) => setPatientLang(e.target.value as "hi" | "bho")}
          >
            <option value="hi">Hindi</option>
            <option value="bho">Bhojpuri</option>
          </select>
        </label>
        <label>
          Doctor language
          <select value={doctorLang} onChange={(e) => setDoctorLang(e.target.value as "ta" | "en")}>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </label>
      </section>

      <button className="primary-button" type="button">
        New consultation
      </button>
      <button className="secondary-button" type="button">
        Try demo consultation
      </button>
    </main>
  );
}
