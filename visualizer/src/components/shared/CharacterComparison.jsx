import "./CharacterComparison.css";

export default function CharacterComparison({
  leftIndexLabel,
  leftChar,
  leftTag = "Left Pointer",
  rightIndexLabel,
  rightChar,
  rightTag = "Right Pointer",
  isMatch,
  ariaLabel = "Character comparison",
}) {
  return (
    <section
      className={`character-comparison ${isMatch ? "is-match" : "is-mismatch"}`}
      aria-label={ariaLabel}
    >
      <div className="character-comparison__card is-left">
        <span className="character-comparison__index">{leftIndexLabel}</span>
        <span className="character-comparison__char">
          &apos;{leftChar}&apos;
        </span>
        <span className="character-comparison__tag">{leftTag}</span>
      </div>

      <div className="character-comparison__operator">
        <span className="character-comparison__operator-symbol">
          {isMatch ? "==" : "≠"}
        </span>
        <span
          className={`character-comparison__badge ${
            isMatch ? "is-match" : "is-mismatch"
          }`}
        >
          {isMatch ? "MATCH ✓" : "MISMATCH ✗"}
        </span>
      </div>

      <div className="character-comparison__card is-right">
        <span className="character-comparison__index">{rightIndexLabel}</span>
        <span className="character-comparison__char">
          &apos;{rightChar}&apos;
        </span>
        <span className="character-comparison__tag">{rightTag}</span>
      </div>
    </section>
  );
}
