import "./GapBudgetView.css";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";

// The range 1..n as a strip. Banned values are crossed out; each gap is shaded by how much of it the budget takes.
export default function GapBudgetView({ run, step }) {
  if (!run || !step) {
    return <section className="gap-view" aria-label="Gaps and budget"><p className="gap-empty">Press Play to take numbers gap by gap.</p></section>;
  }
  const { n, maxSum } = run.input;
  const cells = Array.from({ length: n }, (_, i) => i + 1);
  const banned = new Set(step.forbidden);
  const [glo, ghi] = step.gap || [-1, -2];
  const taken = step.k ?? 0;
  return (
    <section className="gap-view" aria-label="Gaps and budget">
      {step.gap && <AnswerRangeBar title="Count taken from this gap" min={0} max={Math.max(step.len, 1)} low={0} high={step.len} probe={taken} verdict={true} />}
      <div className="gap-strip" role="list">
        {cells.map(x => {
          const isBanned = banned.has(x);
          const inGap = x >= glo && x <= ghi;
          const takenHere = inGap && x < glo + taken;
          const cls = ["gap-cell", isBanned ? "gap-cell--banned" : "", takenHere ? "gap-cell--taken" : "", inGap && !takenHere ? "gap-cell--skipped" : ""].join(" ");
          return <span role="listitem" key={x} className={cls}>{x}{isBanned && <span className="gap-x" aria-label="banned"> ✕</span>}</span>;
        })}
      </div>
      <dl className="gap-state">
        <div><dt>Budget</dt><dd>{maxSum}</dd></div>
        <div><dt>Sum used</dt><dd>{step.total}</dd></div>
        <div><dt>Count</dt><dd>{step.count}</dd></div>
      </dl>
      <p className="gap-note">✕ marks banned numbers. Green numbers are taken; the amber gap is the current one. Taken numbers come from the start of a gap, so they are the smallest available.</p>
    </section>
  );
}
