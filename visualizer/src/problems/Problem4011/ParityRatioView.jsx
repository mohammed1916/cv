import "./ParityRatioView.css";

export default function ParityRatioView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pr-view" aria-label="Even and odd ratio subarrays">
        <p className="pr-empty">Press Play to extend each subarray one value at a time.</p>
      </section>
    );
  }

  const { nums, a, b } = run.input;
  const inRange = i => step.left >= 0 && step.right >= 0 && i >= step.left && i <= step.right;

  return (
    <section className="pr-view" aria-label="Even and odd ratio subarrays">
      <p className="pr-target">Allowed even-to-odd ratio: at most {a} / {b}</p>
      <div className="pr-row">
        {nums.map((v, i) => (
          <div
            key={i}
            className={`pr-cell${v % 2 === 0 ? " pr-cell--even" : " pr-cell--odd"}${inRange(i) ? " pr-cell--range" : ""}`}
          >
            <span className="pr-value">{v}</span>
            <span className="pr-kind">{v % 2 === 0 ? "even" : "odd"}</span>
          </div>
        ))}
      </div>
      <dl className="pr-cards">
        <div><dt>Subarray</dt><dd>{step.left >= 0 && step.right >= 0 ? `${step.left}..${step.right}` : "-"}</dd></div>
        <div><dt>Evens : odds</dt><dd>{step.left >= 0 ? `${step.evens} : ${step.odds}` : "-"}</dd></div>
        <div><dt>Qualifying</dt><dd>{step.count}</dd></div>
      </dl>
      <p className={`pr-verdict${step.ok === true ? " pr-verdict--yes" : step.ok === false ? " pr-verdict--no" : ""}`}>{step.message}</p>
    </section>
  );
}
