import "./DistributeLanesView.css";

// Three lanes: the input in order, then the two arrays. The value being placed is highlighted, and the
// comparison line shows the two last elements that decide where it goes.
export default function DistributeLanesView({ nums, step }) {
  const placed = step.value === null ? -1 : nums.indexOf(step.value);
  const last1 = step.arr1.at(-1);
  const last2 = step.arr2.at(-1);
  const hasCompare = step.phase === "arr1" || step.phase === "arr2";
  const target = step.phase === "arr1" ? "arr1" : step.phase === "arr2" ? "arr2" : null;

  return (
    <section className="dl-view" aria-label="Distributing values into two arrays">
      <Lane label="input" cells={nums} highlight={placed} tone="input" />
      <Lane label="arr1" cells={step.arr1} highlight={step.arr1.length - 1} tone={target === "arr1" ? "target" : "arr1"} />
      <Lane label="arr2" cells={step.arr2} highlight={step.arr2.length - 1} tone={target === "arr2" ? "target" : "arr2"} />
      <p className="dl-compare" role="status">
        {hasCompare
          ? `last of arr1 ${last1} ${last1 > last2 ? ">" : "<"} last of arr2 ${last2}, so ${step.value} goes to ${target}`
          : step.phase === "start"
            ? "The first two values seed the arrays."
            : "Joining arr1 and arr2 gives the answer."}
      </p>
    </section>
  );
}

function Lane({ label, cells, highlight, tone }) {
  return (
    <div className={`dl-lane dl-lane--${tone}`}>
      <span className="dl-label">{label}</span>
      <div className="dl-cells">
        {cells.map((value, i) => (
          <span key={`${i}-${value}`} className={`dl-cell${i === highlight ? " dl-cell--current" : ""}`}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
