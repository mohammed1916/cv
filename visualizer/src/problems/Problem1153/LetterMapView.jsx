import "./LetterMapView.css";
import IndexedSequence from "../../components/shared/IndexedSequence";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// Top: str1 and str2 stacked position by position, with the current position marked.
// Middle: the letter mapping built so far; a conflicting pair is shown in red.
// Bottom: the alphabet strip, showing which letters str2 uses and which spare letters remain.
export default function LetterMapView({ run, step }) {
  if (!run || !step) return null;
  const { str1, str2 } = run.input;
  const mapEntries = Object.entries(step.mapping || {});
  const used = new Set(step.used || str2.split(""));
  const usedCount = new Set(str2).size;
  const conflict = step.conflict;
  return (
    <div className="lm-view">
      <div className="lm-pairs">
        <IndexedSequence
          label="str1"
          length={[...str1].length}
          valueAt={(index) => str1[index]}
          active={step.index ?? -1}
          roleAt={(index) => (index < step.index ? 'done' : '')}
        />
        <IndexedSequence
          label="str2"
          length={[...str2].length}
          valueAt={(index) => str2[index]}
          active={step.index ?? -1}
          roleAt={(index) => (conflict && index === step.index && conflict.to !== str2[index] ? 'conflict' : 'target')}
        />
      </div>

      <div className="lm-map" aria-label="Letter mapping so far">
        <span className="lm-title">mapping</span>
        {mapEntries.length === 0 && <span className="lm-empty">empty</span>}
        {mapEntries.map(([from, to]) => (
          <span key={from} className={`lm-pair${conflict && conflict.from === from ? " lm-pair--bad" : ""}`}>{from} → {to}</span>
        ))}
        {conflict && (
          <span className="lm-pair lm-pair--bad" role="alert">
            {conflict.from} would need {conflict.to}, but it is already {conflict.was}
          </span>
        )}
      </div>

      {step.used !== null || step.phase === "spare" || step.phase === "done" ? (
        <div className="lm-alphabet" aria-label="Letters used by str2">
          <span className="lm-title">{usedCount} of 26 letters used by str2</span>
          <div className="lm-strip">
            {[...ALPHABET].map((letter) => (
              <span key={letter} className={`lm-letter${used.has(letter) ? " lm-letter--used" : ""}`}>{letter}</span>
            ))}
          </div>
          <span className="lm-note">{usedCount === 26 ? "No spare letter is free, so a cycle cannot be broken." : `${26 - usedCount} spare letters are free to break cycles.`}</span>
        </div>
      ) : null}
      <output aria-label="String transform answer">{step.phase === "done" ? `answer ${step.verdict}` : "answer pending"}</output>
    </div>
  );
}
