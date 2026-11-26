export function MicLevelMeter({ level }: { level: number }) {
  return (
    <div className="mic-level-meter" aria-hidden="true">
      <div className="mic-level-fill" style={{ transform: `scaleX(${level})` }} />
    </div>
  );
}
