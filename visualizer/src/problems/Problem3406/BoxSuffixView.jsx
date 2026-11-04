import "./BoxSuffixView.css";

// The word is drawn once. Two candidate starts (i and j) race along the word; the run
// of letters they share is outlined, and the bracket under the word shows the slice
// that would be kept from the current best start, capped at length n - numFriends + 1.
export default function BoxSuffixView({ run, step }) {
  const { word, numFriends } = run.input;
  const n = word.length;
  const cap = n - numFriends + 1;
  const single = numFriends === 1;
  const i = step.i ?? 0;
  const j = step.j ?? -1;
  const off = step.off ?? 0;
  const isSingle = single || step.phase === "single";
  const compareA = step.a;
  const compareB = step.b;

  const roleAt = index => {
    if (isSingle) return "whole";
    if (step.phase === "done" || step.phase === "slice") return index >= i && index < i + cap ? "answer" : "";
    if (index >= i && index < i + off) return "shared";
    return "";
  };

  return (
    <div className="box-suffix" aria-label="Largest box string view">
      <p className="box-suffix__caption">
        {isSingle
          ? `numFriends = 1: the box holds only the whole word`
          : `numFriends = ${numFriends} · keep at most ${cap} letter${cap === 1 ? "" : "s"}`}
      </p>

      <div className="box-suffix__word" role="list" aria-label="Word letters">
        {word.split("").map((letter, index) => (
          <div className={`box-suffix__cell box-suffix__cell--${roleAt(index) || "idle"}`} role="listitem" key={`w-${index}`}>
            <span className="box-suffix__pointer">
              {!isSingle && index === i ? "i (l)" : ""}
              {!isSingle && index === j ? "j (r)" : ""}
            </span>
            <span className="box-suffix__letter">{letter}</span>
            <span className="box-suffix__index">{index}</span>
          </div>
        ))}
      </div>

      {!isSingle && (
        <div className="box-suffix__compare" aria-label="Current comparison">
          {step.phase === "match" || step.phase === "jump" || step.phase === "skip" ? (
            <span>
              {`word[i + ${off}] = ${compareA ?? "-"} ${step.phase === "match" ? "=" : step.phase === "jump" ? "<" : ">"} word[j + ${off}] = ${compareB ?? "-"}`}
            </span>
          ) : (
            <span>{step.phase === "start" ? "Start with i = 0 and j = 1" : "Keep the best start"}</span>
          )}
        </div>
      )}

      <div className="box-suffix__bracket" aria-label="Kept slice">
        {!isSingle && (
          <span className="box-suffix__span" style={{ left: `${(i / n) * 100}%`, width: `${(Math.min(cap, n - i) / n) * 100}%` }}>
            {`keep ${cap} from i = ${i}`}
          </span>
        )}
      </div>

      {step.answer != null && <p className="box-suffix__answer">Candidate answer: <strong>{step.answer}</strong></p>}
    </div>
  );
}
