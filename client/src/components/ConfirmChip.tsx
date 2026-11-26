interface ConfirmChipProps {
  summary: string;
  onRepeat: () => void;
}

export function ConfirmChip({ summary, onRepeat }: ConfirmChipProps) {
  if (!summary) return null;
  return (
    <div className="confirm-chip">
      <span>Samjha: {summary} ✅</span>
      <button type="button" onClick={onRepeat} aria-label="Repeat">
        🔁
      </button>
    </div>
  );
}
