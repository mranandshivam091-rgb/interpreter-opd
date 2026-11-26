import { useRef, useState } from "react";
import { isSttSupported, startListening, type SttHandle } from "../voice/browserStt";
import { startAudioRecording, type AudioRecorderHandle } from "../voice/audioRecorder";
import { MicLevelMeter as MicLevelMeterEngine } from "../voice/recorder";
import { MicLevelMeter } from "./MicLevelMeter";

const HOLD_THRESHOLD_MS = 350;

interface MicButtonProps {
  lang: string; // recognition language for browser-STT mode, e.g. "hi-IN"
  colorClass: string;
  idleLabel: string;
  recordingLabel: string;
  // true when a provider (Gemini/Sarvam) is active: record raw audio and let
  // the caller upload it, instead of using the browser's own recognizer.
  useAudioUpload: boolean;
  disabled?: boolean;
  busyLabel?: string;
  onFinalTranscript?: (transcript: string, confidence: number) => void;
  onAudioRecorded?: (blob: Blob) => void;
}

// Supports two interaction styles on the same button:
// - hold to talk, release to send (press longer than the hold threshold)
// - tap to start, tap again to stop (two quick presses)
export function MicButton({
  lang,
  colorClass,
  idleLabel,
  recordingLabel,
  useAudioUpload,
  disabled,
  busyLabel,
  onFinalTranscript,
  onAudioRecorded,
}: MicButtonProps) {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const sttHandleRef = useRef<SttHandle | null>(null);
  const audioHandlePromiseRef = useRef<Promise<AudioRecorderHandle> | null>(null);
  const meterRef = useRef<MicLevelMeterEngine | null>(null);
  const pressStartedAtRef = useRef(0);

  function startLevelMeter() {
    const meter = new MicLevelMeterEngine();
    meterRef.current = meter;
    // Visual nicety only — if the browser denies/lacks mic access for this
    // separate stream, recording still works, so failures here are silent.
    meter.start(setLevel).catch(() => {});
  }

  function startRecording() {
    pressStartedAtRef.current = Date.now();
    setRecording(true);

    if (useAudioUpload) {
      const promise = startAudioRecording();
      audioHandlePromiseRef.current = promise;
      promise.catch(() => setRecording(false));
      startLevelMeter();
      return;
    }

    if (!isSttSupported()) {
      setRecording(false);
      onFinalTranscript?.("", 0);
      return;
    }

    sttHandleRef.current = startListening(
      lang,
      (result) => onFinalTranscript?.(result.transcript, result.confidence),
      () => {
        setRecording(false);
        meterRef.current?.stop();
        setLevel(0);
      },
    );
    startLevelMeter();
  }

  async function stopRecording() {
    if (useAudioUpload) {
      const promise = audioHandlePromiseRef.current;
      audioHandlePromiseRef.current = null;
      setRecording(false);
      meterRef.current?.stop();
      setLevel(0);
      if (!promise) return;
      try {
        const handle = await promise;
        const blob = await handle.stop();
        onAudioRecorded?.(blob);
      } catch {
        // Mic permission denied or recording failed — just reset to idle.
      }
      return;
    }
    sttHandleRef.current?.stop();
  }

  function handlePointerDown() {
    if (disabled) return;
    if (recording) {
      void stopRecording(); // second tap of a tap-to-start/tap-to-stop pair
      return;
    }
    startRecording();
  }

  function handlePointerUp() {
    if (!recording) return;
    const heldMs = Date.now() - pressStartedAtRef.current;
    if (heldMs >= HOLD_THRESHOLD_MS) {
      void stopRecording(); // hold-to-talk release
    }
    // else: quick tap — keep recording until the next tap stops it.
  }

  const statusLabel = recording ? recordingLabel : disabled && busyLabel ? busyLabel : idleLabel;

  return (
    <div className="mic-button-wrap">
      <button
        type="button"
        className={`mic-button ${colorClass} ${recording ? "recording" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={disabled}
        aria-pressed={recording}
        aria-label={statusLabel}
      >
        {recording ? "⏺" : "🎙"}
      </button>
      {recording && <MicLevelMeter level={level} />}
      <p className="mic-instructions" aria-live="polite">
        {statusLabel}
      </p>
    </div>
  );
}
