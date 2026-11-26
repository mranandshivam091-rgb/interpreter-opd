interface TranscriptBubbleProps {
  mainText: string;
  subText: string;
  doubtful: boolean;
  placeholder: string;
}

export function TranscriptBubble({ mainText, subText, doubtful, placeholder }: TranscriptBubbleProps) {
  if (!mainText) {
    return <p className="transcript-placeholder">{placeholder}</p>;
  }
  return (
    <div className="transcript-bubble">
      {doubtful && <span className="doubtful-tag">⚠ Doubtful</span>}
      <p className="transcript-main">{mainText}</p>
      <p className="transcript-sub">{subText}</p>
    </div>
  );
}
