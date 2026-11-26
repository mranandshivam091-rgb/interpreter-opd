// Records raw audio for upload to a provider's speech endpoint. Unlike browser
// SpeechRecognition, this never cuts a recording short on a pause — it only
// stops when told to.
export interface AudioRecorderHandle {
  stop: () => Promise<Blob>;
}

export async function startAudioRecording(): Promise<AudioRecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    };
  });

  recorder.start();
  return { stop: () => { recorder.stop(); return stopped; } };
}
