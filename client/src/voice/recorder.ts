// Live mic level meter (0-1), independent of speech recognition, shown while recording.
export class MicLevelMeter {
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private rafId: number | null = null;

  async start(onLevel: (level: number) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    const analyser = this.audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      onLevel(Math.min(1, avg / 128));
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.stream?.getTracks().forEach((track) => track.stop());
    void this.audioCtx?.close();
    this.rafId = null;
    this.stream = null;
    this.audioCtx = null;
  }
}
