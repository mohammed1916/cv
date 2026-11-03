import "./OddSumParityView.css";

// Two counters, one per parity of subsequence sum. Each element is a tile; an odd tile swaps the two
// counters into each other while an even tile doubles both. The active tile is outlined.
export default function OddSumParityView({ run, step }) {
  if (!run || !step) return <p className="osp-empty">Press Play to watch the parity counts change.</p>;
  const { input } = run;
  const active = step.index;
  const placed = step.phase === "done" ? input.length : Math.max(0, active + (step.phase === "update" ? 1 : 0));

  return (
    <section className="osp-view" aria-label="Odd sum subsequence counts">
      <ol className="osp-tiles" aria-label="Elements in order">
        {input.map((x, i) => (
          <li key={i} className={`osp-tile ${x % 2 ? "osp-tile--odd" : "osp-tile--even"}${i === active ? " osp-tile--active" : ""}${i < placed ? " osp-tile--done" : ""}`}>
            <span className="osp-tile__value">{x}</span>
            <span className="osp-tile__parity">{x % 2 ? "odd" : "even"}</span>
          </li>
        ))}
      </ol>
      <div className="osp-counters">
        <div className="osp-counter osp-counter--odd">
          <span className="osp-counter__label">Odd-sum subsets</span>
          <strong className="osp-counter__value">{step.odd}</strong>
        </div>
        <div className="osp-counter osp-counter--even">
          <span className="osp-counter__label">Even-sum subsets (incl. empty)</span>
          <strong className="osp-counter__value">{step.even}</strong>
        </div>
      </div>
      <p className="osp-rule">
        {step.index < 0 || step.x === null
          ? "Empty start: even = 1, odd = 0."
          : step.isOdd
            ? "Odd x: new odd = old odd + old even; new even = old even + old odd."
            : "Even x: both counts double, because x can join or stay out of every subset."}
      </p>
    </section>
  );
}
