// Detects mentions of medicine, pain, fever, pregnancy, sugar/diabetes, BP, or
// treatment in Hindi (Devanagari + romanized), Tamil, or English, in either
// the patient's or doctor's speech, to trigger the safety-check questions.
export type SafetyQuestionId = "allergy" | "currentMedicine" | "pregnant";

export const SAFETY_QUESTIONS: Record<SafetyQuestionId, { hi: string; label: { ta: string; en: string } }> = {
  allergy: {
    hi: "Kya aapko kisi dawai se allergy hai?",
    label: { ta: "ஒவ்வாமை", en: "Allergy" },
  },
  currentMedicine: {
    hi: "Abhi koi dawai le rahe hain?",
    label: { ta: "தற்போதைய மருந்து", en: "Current medicine" },
  },
  pregnant: {
    hi: "Kya aap pregnant hain?",
    label: { ta: "கர்ப்பம்", en: "Pregnant" },
  },
};

const TRIGGER_WORDS = [
  // medicine
  "दवाई", "दवा", "dawai", "dawa", "marundhu", "மருந்து", "medicine", "medication",
  // pain
  "दर्द", "dard", "vali", "வலி", "pain",
  // fever
  "बुखार", "bukhar", "kaaichal", "காய்ச்சல்", "fever",
  // pregnancy
  "गर्भवती", "garbhvati", "pregnant", "pregnancy", "கர்ப்பம்", "karpam",
  // sugar / diabetes
  "शुगर", "सुगर", "sugar", "diabetes", "sakkarai", "சர்க்கரை", "madhumeham", "மதுமேகம்",
  // blood pressure
  "बीपी", "bp", "blood pressure", "ratha azhutham", "ரத்த அழுத்தம்",
  // treatment
  "इलाज", "ilaj", "चिकित्सा", "chikitsa", "treatment", "sigichai", "சிகிச்சை", "maruthuvam", "மருத்துவம்",
];

export function containsSafetyTrigger(text: string): boolean {
  const normalized = text.toLowerCase();
  return TRIGGER_WORDS.some((word) => normalized.includes(word.toLowerCase()));
}
