// Collapsed Playback Controls: Prev / Play / Next as SVG icons, plus a step timeline, on one line.
const icon = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", focusable: "false" };

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
      <button type="button" className="pc-btn pc-btn-ghost compact-btn" onClick={onPrev} disabled={prevDisabled} aria-label="Previous step" title="Previous step">
        <svg {...icon}><rect x="5" y="5" width="2.5" height="14" /><polygon points="18,5 18,19 9,12" /></svg>
      </button>
      <button type="button" className="pc-btn pc-btn-play compact-btn" onClick={onPlayToggle} aria-label={playLabel} title={playLabel}>
        {isPlaying
          ? <svg {...icon}><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
          : <svg {...icon}><polygon points="7,5 19,12 7,19" /></svg>}
      </button>
      <button type="button" className="pc-btn pc-btn-ghost compact-btn" onClick={onNext} disabled={nextDisabled} aria-label="Next step" title="Next step">
        <svg {...icon}><polygon points="6,5 6,19 15,12" /><rect x="16.5" y="5" width="2.5" height="14" /></svg>
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
