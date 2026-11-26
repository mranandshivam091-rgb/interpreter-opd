import { SAFETY_QUESTIONS, type SafetyQuestionId } from "../logic/safetyTriggers";

export interface SafetyNote {
  questionId: SafetyQuestionId;
  original: string;
  translated: string;
}

interface SafetyCardProps {
  notes: SafetyNote[];
  doctorLang: "ta" | "en";
  onRunCheck: () => void;
}

const SAFETY_CHECK_LABEL: Record<"ta" | "en", string> = {
  ta: "பாதுகாப்பு சோதனை",
  en: "Safety check",
};

export function SafetyCard({ notes, doctorLang, onRunCheck }: SafetyCardProps) {
  // Allergies are the highest-stakes entry, so they always sort to the top.
  const sorted = [...notes].sort((a, b) => {
    if (a.questionId === "allergy") return -1;
    if (b.questionId === "allergy") return 1;
    return 0;
  });

  return (
    <div className="safety-card">
      <div className="safety-card-header">
        <h3>Safety notes / பாதுகாப்பு குறிப்புகள்</h3>
        <button type="button" className="safety-check-button" onClick={onRunCheck}>
          {SAFETY_CHECK_LABEL[doctorLang]}
        </button>
      </div>
      {sorted.length > 0 && (
        <ul className="safety-note-list">
          {sorted.map((note) => (
            <li key={note.questionId} className={note.questionId === "allergy" ? "allergy" : ""}>
              {note.questionId === "allergy" && <span aria-hidden="true">⚠ </span>}
              <strong>{SAFETY_QUESTIONS[note.questionId].label[doctorLang]}:</strong> {note.translated}
              <span className="safety-note-original"> ({note.original})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
