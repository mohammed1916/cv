import "./SplitGcdView.css";

// The array is drawn as value tiles. The removed tile is struck through, and the split under test
// is shown as a gap with the prefix gcd on the left and the suffix gcd on the right.
export default function SplitGcdView({ run, step }) {
  if (!run || !step) return <p className="sg-empty">Press Play to try each removal.</p>;
  const { nums } = run.input;
  const removedIndex = step.removed;
  const kept = nums.map((value, index) => ({ value, index })).filter(item => item.index !== removedIndex);
  const b = step.b || [];
  const split = step.split;
  return (
    <section className="sg-view" aria-label="Valid split positions">
      <p className="sg-caption">{removedIndex === null || removedIndex === undefined ? "Nothing removed" : `Removed index ${removedIndex}`} · best {step.best}</p>
      <ol className="sg-tiles" aria-label="Values in the array">
        {nums.map((value, index) => (
          <li key={index} className={index === removedIndex ? "sg-tile sg-tile--removed" : "sg-tile"}>
            <span>{value}</span>
            <small>{index}</small>
          </li>
        ))}
      </ol>
      {split !== undefined && b.length > 0 && (
        <div className={step.matched ? "sg-split sg-split--match" : "sg-split"} aria-label={`Split after ${split}`}>
          <span>{`prefix ${b.slice(0, split).join(", ")} gcd ${step.pre}`}</span>
          <span className="sg-bar" aria-hidden="true">|</span>
          <span>{`suffix ${b.slice(split).join(", ")} gcd ${step.suf}`}</span>
        </div>
      )}
      <p className="sg-readout">{kept.length ? `Kept values: ${kept.map(k => k.value).join(", ")}` : "Kept values: none"} · splits counted here: {step.count ?? 0}</p>
    </section>
  );
}
