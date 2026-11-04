import "./RotationCostView.css";

// Shows the rotated string as a row of letters with mirror pairs joined by arcs, and a bar per rotation tried.
export default function RotationCostView({ run, step }) {
  if (!run || !step) return <p className="rc-empty">Press Play to try every rotation.</p>;
  const s = run.input.s;
  const n = s.length;
  const t = step.t;
  const maxCost = Math.max(1, ...step.table.map(row => row.cost), step.cost || 0);
  const activePairs = new Set(step.pairs.map(p => `${p.i}-${p.j}`));
  // l and r mark the mirror pair priced most recently in this rotation.
  const lastPair = step.pairs.length ? step.pairs[step.pairs.length - 1] : null;
  return (
    <section className="rc-view" aria-label="Rotated palindrome costs">
      <p className="rc-caption">Rotated string {t || "-"} {step.r >= 0 ? `(left by ${step.r})` : ""}</p>
      <ol className="rc-letters" aria-label={`Rotated string ${t}`}>
        {[...t].map((ch, index) => {
          const mirror = n - 1 - index;
          const pairOn = [...activePairs].some(key => key.split("-").map(Number).includes(index));
          return (
            <li key={index} className={pairOn ? "rc-letter rc-letter--paired" : "rc-letter"}>
              <span>{ch}</span>
              <small>{index === lastPair?.i ? "l" : index === lastPair?.j ? "r" : mirror !== index ? `mirror ${mirror}` : "middle"}</small>
            </li>
          );
        })}
      </ol>
      <ul className="rc-pairs" aria-label="Mirror pair prices">
        {step.pairs.map(p => (
          <li key={`${p.i}-${p.j}`}>{`${t[p.i]} to ${t[p.j]}: forward ${p.d}, cheaper ${p.price}`}</li>
        ))}
      </ul>
      <div className="rc-bars" role="list" aria-label="Cost of each rotation">
        {step.table.map(row => (
          <div role="listitem" key={row.r} className={row.r === step.r ? "rc-bar rc-bar--current" : "rc-bar"}>
            <span className="rc-fill" style={{ width: `${Math.round((row.cost / maxCost) * 100)}%` }} />
            <span className="rc-text">{`r=${row.r}: ${row.cost}`}</span>
          </div>
        ))}
      </div>
      <p className="rc-readout">Best so far: {step.best ?? "none yet"}</p>
    </section>
  );
}
