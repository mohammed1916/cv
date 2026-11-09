// Collapsed Playback Controls: the same Prev / Play / Next buttons as the expanded panel, plus a step timeline.
export default function CompactPlayback({
  isPlaying,
  isDone,
  onPlayToggle,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  stepIndex,
  total,
  onSeek,
}) {
  const max = Math.max(0, total - 1);
  const value = Math.min(Math.max(stepIndex, 0), max);
  const playLabel = isPlaying ? "Pause" : isDone ? "Replay" : "Play";

  return (
    <div className="compact-playback">
      <button type="button" className="pc-btn pc-btn-ghost" onClick={onPrev} disabled={prevDisabled}>
        Prev
      </button>
      <button type="button" className="pc-btn pc-btn-play" onClick={onPlayToggle}>
        {playLabel}
      </button>
      <button type="button" className="pc-btn pc-btn-ghost" onClick={onNext} disabled={nextDisabled}>
        Next
      </button>
      <input
        type="range"
        className="compact-timeline"
        min={0}
        max={max}
        step={1}
        value={value}
        disabled={total <= 0}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Step timeline"
      />
    </div>
  );
}
