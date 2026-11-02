import "./EvenEndingsView.css";

// The array as tiles tagged even or odd. For the current index, the starts that give an even product are shaded.
export default function EvenEndingsView({ run, step }) {
  if (!run || !step) {
    return <section className="even-view" aria-label="Even product subarrays"><p className="even-empty">Press Play to scan the array.</p></section>;
  }
  const nums = run.input;
  const i = step.i;
  return (
    <section className="even-view" aria-label="Even product subarrays">
      <div className="even-row" role="list">
        {nums.map((v, k) => {
          const even = v % 2 === 0;
          const qualifyingStart = i !== null && i !== undefined && k === i;
          const shadedStart = i !== null && i !== undefined && k <= step.lastEven && k <= i;
          return (
            <span key={k} role="listitem" className={`even-tile ${even ? "even-tile--even" : "even-tile--odd"}${qualifyingStart ? " even-tile--current" : ""}${shadedStart && !even ? " even-tile--start" : ""}`}>
              <span className="even-value">{v}</span>
              <span className="even-tag">{even ? "even" : "odd"}</span>
              <span className="even-index">{k}</span>
            </span>
          );
        })}
      </div>
      <dl className="even-state">
        <div><dt>Last even index</dt><dd>{step.lastEven >= 0 ? step.lastEven : "none"}</dd></div>
        <div><dt>Added at this index</dt><dd>{i === null ? "-" : step.added}</dd></div>
        <div><dt>Total</dt><dd>{step.count}</dd></div>
      </dl>
      <p className="even-note">Amber outline marks the current index. Shaded starts are the subarrays ending here that contain an even value.</p>
    </section>
  );
}
