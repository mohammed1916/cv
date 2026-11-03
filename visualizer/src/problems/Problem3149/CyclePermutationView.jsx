import "./CyclePermutationView.css";

const RADIUS = 42;

export default function CyclePermutationView({ run, step }) {
  const nums = run.input.nums;
  const n = nums.length;
  const placed = step.perm;
  const candidateValues = new Map((step.candidates || []).map((c) => [c.value, c.cost]));
  const point = (k) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * k) / n;
    return { x: 50 + RADIUS * Math.cos(angle), y: 50 + RADIUS * Math.sin(angle) };
  };

  return (
    <div className="cycle-view" aria-label="Cycle permutation visual">
      <div className="cycle-view__ring">
        <svg className="cycle-view__lines" viewBox="0 0 100 100" aria-hidden="true">
          {placed.slice(1).map((value, idx) => {
            const from = point(placed[idx]);
            const to = point(value);
            return <line key={`p-${idx}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
          {step.closing !== null && placed.length > 1 && (() => {
            const from = point(placed[placed.length - 1]);
            const to = point(placed[0]);
            return <line className="cycle-view__closing" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })()}
        </svg>
        {Array.from({ length: n }, (_, value) => {
          const p = point(value);
          const isPlaced = placed.includes(value);
          const isChosen = step.chosen === value;
          const isCandidate = candidateValues.has(value);
          const classes = ["cycle-view__node"];
          if (isPlaced) classes.push("cycle-view__node--placed");
          if (isCandidate) classes.push("cycle-view__node--candidate");
          if (isChosen) classes.push("cycle-view__node--chosen");
          return (
            <div key={value} className={classes.join(" ")} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <span className="cycle-view__value">{value}</span>
              <span className="cycle-view__meta">nums[{value}]={nums[value]}</span>
              {isCandidate && <span className="cycle-view__cost">cost {candidateValues.get(value)}</span>}
            </div>
          );
        })}
      </div>

      <ol className="cycle-view__path" aria-label="Permutation so far">
        {placed.map((value, i) => <li key={`${i}-${value}`}>{value}</li>)}
        {step.closing !== null && <li className="cycle-view__back">back to 0</li>}
      </ol>

      <dl className="cycle-view__facts">
        <div><dt>Running score</dt><dd>{step.spent}</dd></div>
        <div><dt>Cheapest completion left</dt><dd>{step.remaining}</dd></div>
      </dl>
      <p className="cycle-view__message">{step.message}</p>
    </div>
  );
}
