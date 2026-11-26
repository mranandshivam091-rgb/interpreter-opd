import { ProviderBadge } from "../components/ProviderBadge";
import type { ProviderName } from "../api";

interface StartScreenProps {
  provider: ProviderName | null;
  patientLang: "hi" | "bho";
  doctorLang: "ta" | "en";
  onPatientLangChange: (lang: "hi" | "bho") => void;
  onDoctorLangChange: (lang: "ta" | "en") => void;
  onStart: () => void;
}

// "Try demo consultation" also opens the live conversation screen for now —
// scripted sample consultations land in a later step.
export function StartScreen({
  provider,
  patientLang,
  doctorLang,
  onPatientLangChange,
  onDoctorLangChange,
  onStart,
}: StartScreenProps) {
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
            onChange={(e) => onPatientLangChange(e.target.value as "hi" | "bho")}
          >
            <option value="hi">Hindi</option>
            <option value="bho">Bhojpuri</option>
          </select>
        </label>
        <label>
          Doctor language
          <select value={doctorLang} onChange={(e) => onDoctorLangChange(e.target.value as "ta" | "en")}>
            <option value="ta">Tamil</option>
            <option value="en">English</option>
          </select>
        </label>
      </section>

      <button className="primary-button" type="button" onClick={onStart}>
        New consultation
      </button>
      <button className="secondary-button" type="button" onClick={onStart}>
        Try demo consultation
      </button>
    </main>
  );
}
