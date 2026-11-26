import { useState } from "react";
import { MicButton } from "../components/MicButton";
import { TranscriptBubble } from "../components/TranscriptBubble";
import { ConfirmChip } from "../components/ConfirmChip";
import { speak } from "../voice/browserTts";
import { translatePhrase, type Lang } from "../logic/phrases";
import { transcribeAndTranslateViaApi, type ProviderName } from "../api";

interface ConversationScreenProps {
  patientLang: "hi" | "bho";
  doctorLang: "ta" | "en";
  provider: ProviderName | null;
  onBack: () => void;
}

interface Heard {
  mainText: string;
  subText: string;
  doubtful: boolean;
}

const EMPTY_HEARD: Heard = { mainText: "", subText: "", doubtful: false };
const NOT_CLEAR_HI = "Awaaz saaf nahi aayi, phone ke paas aakar boliye";
const NOT_CLEAR_TA = "சத்தம் தெளிவாக கேட்கவில்லை, போனுக்கு அருகில் வந்து பேசுங்கள்";
const LOW_CONFIDENCE_THRESHOLD = 0.6;
const MIN_WORDS = 2;

const PATIENT_LANG_NAME: Record<"hi" | "bho", string> = { hi: "Hindi", bho: "Bhojpuri" };
const DOCTOR_LANG_NAME: Record<"ta" | "en", string> = { ta: "Tamil", en: "English" };
const PATIENT_IDLE_LABEL = "बोलने के लिए दबाकर रखें या टैप करें";
const PATIENT_RECORDING_LABEL = "🔴 सुन रहे हैं...";
const PATIENT_BUSY_LABEL = "⏳ समझ रहे हैं...";
const DOCTOR_IDLE_LABEL: Record<"ta" | "en", string> = {
  ta: "பேச அழுத்தி பிடியுங்கள் அல்லது தட்டவும்",
  en: "Hold or tap to speak",
};
const DOCTOR_RECORDING_LABEL: Record<"ta" | "en", string> = {
  ta: "🔴 கேட்கிறது...",
  en: "🔴 Recording...",
};
const DOCTOR_BUSY_LABEL: Record<"ta" | "en", string> = {
  ta: "⏳ செயலாக்குகிறது...",
  en: "⏳ Processing...",
};

function shortSummary(text: string, maxWords = 6): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : `${words.slice(0, maxWords).join(" ")}…`;
}

function langCode(lang: Lang): string {
  if (lang === "hi") return "hi-IN";
  if (lang === "ta") return "ta-IN";
  return "en-IN";
}

export function ConversationScreen({ patientLang, doctorLang, provider, onBack }: ConversationScreenProps) {
  // What the doctor hears (translated from the patient) and what the patient hears
  // (translated from the doctor), plus a confirmation chip of each speaker's own last turn.
  const [heardByDoctor, setHeardByDoctor] = useState<Heard>(EMPTY_HEARD);
  const [heardByPatient, setHeardByPatient] = useState<Heard>(EMPTY_HEARD);
  const [patientSummary, setPatientSummary] = useState("");
  const [doctorSummary, setDoctorSummary] = useState("");
  const [patientBusy, setPatientBusy] = useState(false);
  const [doctorBusy, setDoctorBusy] = useState(false);
  // What the doctor is about to speak, which may differ from their general
  // reading language (doctors code-switch into English for clinical terms).
  // Only matters for the browser recognizer in demo mode — Gemini handles
  // mixed-language audio directly.
  const [doctorSpeakLang, setDoctorSpeakLang] = useState<"ta" | "en">(doctorLang);

  const hasProvider = Boolean(provider && provider !== "none");
  const patientRecognitionLang = "hi-IN"; // Bhojpuri falls back to Hindi recognition
  const doctorRecognitionLang = langCode(doctorSpeakLang);

  async function handleSpeechTurn(
    transcript: string,
    confidence: number,
    fromLang: Lang,
    toLang: Lang,
    onNotClear: () => void,
    setHeardByListener: (heard: Heard) => void,
    setSpeakerSummary: (summary: string) => void,
  ) {
    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    if (!transcript || wordCount < MIN_WORDS || confidence < LOW_CONFIDENCE_THRESHOLD) {
      onNotClear();
      return;
    }

    setSpeakerSummary(shortSummary(transcript));

    const { text: translated, matched } = translatePhrase(transcript, fromLang, toLang);
    setHeardByListener({ mainText: translated, subText: transcript, doubtful: !matched });
    speak(translated, langCode(toLang));
  }

  function handlePatientSpeech(transcript: string, confidence: number) {
    void handleSpeechTurn(
      transcript,
      confidence,
      "hi",
      doctorLang,
      () => speak(NOT_CLEAR_HI, "hi-IN"),
      setHeardByDoctor,
      setPatientSummary,
    );
  }

  function handleDoctorSpeech(transcript: string, confidence: number) {
    void handleSpeechTurn(
      transcript,
      confidence,
      doctorSpeakLang,
      "hi",
      () => speak(NOT_CLEAR_TA, "ta-IN"),
      setHeardByPatient,
      setDoctorSummary,
    );
  }

  // Provider path: upload the raw recording and let Gemini transcribe and
  // translate it in one step, so mixed-language speech and long sentences
  // (no pause-based cutoff from a browser recognizer) are handled correctly.
  async function handlePatientAudio(blob: Blob) {
    setPatientBusy(true);
    try {
      const result = await transcribeAndTranslateViaApi(blob, doctorLang);
      if (result.originalText && result.translatedText) {
        setHeardByDoctor({ mainText: result.translatedText, subText: result.originalText, doubtful: false });
        setPatientSummary(shortSummary(result.originalText));
        speak(result.translatedText, langCode(doctorLang));
      } else {
        speak(NOT_CLEAR_HI, "hi-IN");
      }
    } catch {
      speak(NOT_CLEAR_HI, "hi-IN");
    } finally {
      setPatientBusy(false);
    }
  }

  async function handleDoctorAudio(blob: Blob) {
    setDoctorBusy(true);
    try {
      const result = await transcribeAndTranslateViaApi(blob, "hi");
      if (result.originalText && result.translatedText) {
        setHeardByPatient({ mainText: result.translatedText, subText: result.originalText, doubtful: false });
        setDoctorSummary(shortSummary(result.originalText));
        speak(result.translatedText, "hi-IN");
      } else {
        speak(NOT_CLEAR_TA, "ta-IN");
      }
    } catch {
      speak(NOT_CLEAR_TA, "ta-IN");
    } finally {
      setDoctorBusy(false);
    }
  }

  return (
    <div className="conversation-screen">
      <button type="button" className="back-button" onClick={onBack} aria-label="Back to start">
        ←
      </button>

      <section className="half doctor-half">
        <h2 className="half-label">Doctor · {DOCTOR_LANG_NAME[doctorLang]}</h2>
        <TranscriptBubble
          mainText={heardByDoctor.mainText}
          subText={heardByDoctor.subText}
          doubtful={heardByDoctor.doubtful}
          placeholder="Patient's speech will appear here"
        />
        <ConfirmChip summary={doctorSummary} onRepeat={() => speak(heardByPatient.mainText, "hi-IN")} />
        {!hasProvider && (
          <div className="lang-toggle" role="group" aria-label="Doctor speaking language">
            <button
              type="button"
              className={doctorSpeakLang === "ta" ? "active" : ""}
              onClick={() => setDoctorSpeakLang("ta")}
            >
              TA
            </button>
            <button
              type="button"
              className={doctorSpeakLang === "en" ? "active" : ""}
              onClick={() => setDoctorSpeakLang("en")}
            >
              EN
            </button>
          </div>
        )}
        <MicButton
          lang={doctorRecognitionLang}
          colorClass="doctor-mic"
          idleLabel={DOCTOR_IDLE_LABEL[doctorSpeakLang]}
          recordingLabel={DOCTOR_RECORDING_LABEL[doctorSpeakLang]}
          useAudioUpload={hasProvider}
          disabled={doctorBusy}
          busyLabel={DOCTOR_BUSY_LABEL[doctorSpeakLang]}
          onFinalTranscript={handleDoctorSpeech}
          onAudioRecorded={handleDoctorAudio}
        />
      </section>

      <section className="half patient-half">
        <h2 className="half-label">Patient · {PATIENT_LANG_NAME[patientLang]}</h2>
        <MicButton
          lang={patientRecognitionLang}
          colorClass="patient-mic"
          idleLabel={PATIENT_IDLE_LABEL}
          recordingLabel={PATIENT_RECORDING_LABEL}
          useAudioUpload={hasProvider}
          disabled={patientBusy}
          busyLabel={PATIENT_BUSY_LABEL}
          onFinalTranscript={handlePatientSpeech}
          onAudioRecorded={handlePatientAudio}
        />
        <ConfirmChip summary={patientSummary} onRepeat={() => speak(heardByDoctor.mainText, langCode(doctorLang))} />
        <TranscriptBubble
          mainText={heardByPatient.mainText}
          subText={heardByPatient.subText}
          doubtful={heardByPatient.doubtful}
          placeholder="Doctor's speech will appear here"
        />
      </section>
    </div>
  );
}
