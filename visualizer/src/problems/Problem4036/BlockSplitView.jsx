import "./BlockSplitView.css";

// Each block is a run of 2^k copies of a that has merged into one letter. Blocks are laid out
// left to right in the order they are written, with the copies left over shown as a count.
export default function BlockSplitView({ run, step }) {
  if (!run || !step) return <p className="bs-empty">Press Play to split each count into merged blocks.</p>;
  const x = step.x;
  const placed = step.s ? [...step.s].map(ch => ch.charCodeAt(0) - 97) : [];
  return (
    <section className="bs-view" aria-label="Merged blocks for a count">
      <p className="bs-caption">{x === null || x === undefined ? "All counts processed" : `Count x = ${x}, copies left ${step.rem}`}</p>
      <div className="bs-row" aria-label={`Blocks written so far: ${step.s || "none"}`}>
        {placed.map((k, i) => (
          <div key={i} className="bs-block" style={{ flexGrow: 2 ** k }}>
            <span className="bs-letter">{String.fromCharCode(97 + k)}</span>
            <small>{`${2 ** k} copies`}</small>
          </div>
        ))}
        {step.rem > 0 && <div className="bs-rest" style={{ flexGrow: step.rem }}>{`${step.rem} left`}</div>}
      </div>
      <ul className="bs-answers" aria-label="Answers so far">
        {step.answers.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </section>
  );
}
