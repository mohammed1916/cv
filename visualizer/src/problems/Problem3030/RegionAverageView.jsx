import "./RegionAverageView.css";

const cellShade = (value) => `hsl(210 55% ${96 - Math.round((value / 255) * 62)}%)`;

function inWindow(step, i, j) {
  if (!step.region) return false;
  const [r, c] = step.region;
  return i >= r && i < r + 3 && j >= c && j < c + 3;
}

export default function RegionAverageView({ run, step }) {
  const image = run.input.image;
  const m = image.length;
  const n = image[0].length;
  const pair = step.pair;
  const pairKey = pair ? [...pair.a, ...pair.b].join(",") : "";
  const isEnd = (i, j) => pair && ((pair.a[0] === i && pair.a[1] === j) || (pair.b[0] === i && pair.b[1] === j));

  return (
    <div className="region-view" aria-label="Region average visual">
      <section className="region-view__panel">
        <h3>Image (window outlined)</h3>
        <div className="region-view__grid" style={{ gridTemplateColumns: `repeat(${n}, 3.2rem)` }}>
          {image.map((row, i) => row.map((value, j) => {
            const classes = ["region-view__cell"];
            if (inWindow(step, i, j)) classes.push("region-view__cell--window");
            if (step.cell && step.cell[0] === i && step.cell[1] === j) classes.push("region-view__cell--current");
            if (isEnd(i, j)) classes.push(pair.ok ? "region-view__cell--ok" : "region-view__cell--bad");
            return (
              <div key={`${i}-${j}`} className={classes.join(" ")} style={{ background: cellShade(value) }} data-pair={pairKey}>
                <span className="region-view__value">{value}</span>
                <span className="region-view__coord">{i},{j}</span>
              </div>
            );
          }))}
        </div>
        {pair ? (
          <p className={`region-view__pair ${pair.ok ? "region-view__pair--ok" : "region-view__pair--bad"}`}>
            {pair.ok ? "Within" : "Above"} threshold: difference {pair.diff}, threshold {run.input.threshold}
          </p>
        ) : (
          <p className="region-view__pair">Threshold {run.input.threshold}. Compare neighbours in the window.</p>
        )}
      </section>

      <section className="region-view__panel">
        <h3>Floored window means</h3>
        <div className="region-view__grid" style={{ gridTemplateColumns: `repeat(${Math.max(n - 2, 1)}, 3.2rem)` }}>
          {step.regionMean.map((row, i) => row.map((value, j) => {
            const active = step.region && step.region[0] === i && step.region[1] === j;
            return (
              <div key={`m-${i}-${j}`} className={`region-view__cell region-view__cell--mean ${active ? "region-view__cell--current" : ""} ${value === null ? "region-view__cell--empty" : ""}`}>
                <span className="region-view__value">{value === null ? "-" : value}</span>
                <span className="region-view__coord">{i},{j}</span>
              </div>
            );
          }))}
        </div>
        <p className="region-view__note">Totals and counts per pixel: {step.total.map((row, i) => row.map((t, j) => `${t}/${step.count[i][j]}`).join(" ")).join(" | ")}</p>
      </section>

      <section className="region-view__panel">
        <h3>Result grid</h3>
        <div className="region-view__grid" style={{ gridTemplateColumns: `repeat(${n}, 3.2rem)` }}>
          {step.result.map((row, i) => row.map((value, j) => {
            const done = value !== null;
            const current = step.cell && step.cell[0] === i && step.cell[1] === j;
            return (
              <div key={`r-${i}-${j}`} className={`region-view__cell region-view__cell--result ${current ? "region-view__cell--current" : ""} ${done ? "" : "region-view__cell--empty"}`}>
                <span className="region-view__value">{done ? value : "-"}</span>
                <span className="region-view__coord">{i},{j}</span>
              </div>
            );
          }))}
        </div>
        <p className="region-view__note">{step.message}</p>
      </section>
    </div>
  );
}
