import "./MergeCloseView.css";

// Shows the current string as tiles. The left partner i and right partner j are marked, and the
// characters already deleted are listed beside the string with their original positions.
export default function MergeCloseView({ run, step }) {
  if (!run || !step) return <p className="mc-empty">Press Play to merge close equal letters.</p>;
  const { k } = run.input;
  const tiles = [...step.s];
  const j = step.j;
  const i = step.i;
  const span = i >= 0 && j > i && j - i <= k;
  return (
    <section className="mc-view" aria-label="Merge close characters">
      <p className="mc-rule">Keep the left letter, delete the right one, when the two are equal and at most {k} apart.</p>
      <ol className="mc-tiles" aria-label={`Current string ${step.s}`}>
        {tiles.map((ch, index) => {
          const cls = index === i ? "mc-tile mc-tile--left" : index === j ? "mc-tile mc-tile--right" : "mc-tile";
          return (
            <li key={`${index}-${ch}`} className={cls} aria-label={`${ch} at index ${index}`}>
              <span className="mc-char">{ch}</span>
              <span className="mc-index">{index}{index === i ? ' · l' : index === j ? ' · r' : ''}</span>
            </li>
          );
        })}
      </ol>
      <div className={`mc-gap ${span ? (step.matched ? "mc-gap--match" : "mc-gap--miss") : ""}`} aria-hidden="true">
        {span ? `distance ${j - i} of at most ${k}${step.matched ? ", equal letters" : ", letters differ"}` : "no pair under test"}
      </div>
      <p className="mc-removed">Deleted so far: {step.removed?.length ? step.removed.map(r => `${r.char} (was at ${r.index})`).join(", ") : "nothing yet"}</p>
    </section>
  );
}
