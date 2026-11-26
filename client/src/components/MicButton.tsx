import { useRef, useState } from "react";
import { isSttSupported, startListening, type SttHandle } from "../voice/browserStt";
import { MicLevelMeter as MicLevelMeterEngine } from "../voice/recorder";
import { MicLevelMeter } from "./MicLevelMeter";

const HOLD_THRESHOLD_MS = 350;

interface MicButtonProps {
  lang: string; // recognition language, e.g. "hi-IN"
  colorClass: string;
  idleLabel: string;
  recordingLabel: string;
  onFinalTranscript: (transcript: string, confidence: number) => void;
}

// Supports two interaction styles on the same button:
// - hold to talk, release to send (press longer than the hold threshold)
// - tap to start, tap again to stop (two quick presses)
export function MicButton({ lang, colorClass, idleLabel, recordingLabel, onFinalTranscript }: MicButtonProps) {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const sttHandleRef = useRef<SttHandle | null>(null);
  const meterRef = useRef<MicLevelMeterEngine | null>(null);
  const pressStartedAtRef = useRef(0);

  function startRecording() {
    pressStartedAtRef.current = Date.now();
    setRecording(true);

    if (!isSttSupported()) {
      setRecording(false);
      onFinalTranscript("", 0);
      return;
    }

    sttHandleRef.current = startListening(
      lang,
      (result) => onFinalTranscript(result.transcript, result.confidence),
      () => {
        setRecording(false);
        meterRef.current?.stop();
        setLevel(0);
      },
    );

    // Mic level meter is a visual nicety — if the browser denies/lacks mic access
    // for a separate stream, recognition still works, so failures here are silent.
    const meter = new MicLevelMeterEngine();
    meterRef.current = meter;
    meter.start(setLevel).catch(() => {});
  }

  function stopRecording() {
    sttHandleRef.current?.stop();
  }

  function handlePointerDown() {
    if (recording) {
      stopRecording(); // second tap of a tap-to-start/tap-to-stop pair
      return;
    }
    startRecording();
  }

  function handlePointerUp() {
    if (!recording) return;
    const heldMs = Date.now() - pressStartedAtRef.current;
    if (heldMs >= HOLD_THRESHOLD_MS) {
      stopRecording(); // hold-to-talk release
    }
    // else: quick tap — keep recording until the next tap stops it.
  }

  return (
    <div className="mic-button-wrap">
      <button
        type="button"
        className={`mic-button ${colorClass} ${recording ? "recording" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-pressed={recording}
        aria-label={recording ? recordingLabel : idleLabel}
      >
        {recording ? "⏺" : "🎙"}
      </button>
      {recording && <MicLevelMeter level={level} />}
      <p className="mic-instructions" aria-live="polite">
        {recording ? recordingLabel : idleLabel}
      </p>
    </div>
  );
}
