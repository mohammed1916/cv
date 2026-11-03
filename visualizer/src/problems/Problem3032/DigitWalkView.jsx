import "./DigitWalkView.css";

// Shows one bound's digits, the prefix fixed so far, the digit under test, the smaller digits it allows, and the running total.
export default function DigitWalkView({ run, step }) {
  const digits = step.digits ?? "";
  const pos = step.pos ?? -1;
  const used = step.used ?? [];
  const cands = step.cands ?? [];
  const boundLabel = step.part === "a-1" ? `a - 1 = ${run.input.a - 1}` : step.part === "answer" ? "answer" : `b = ${run.input.b}`;

  return (
    <div className="digitWalk" aria-label="Digit walk for counting distinct-digit numbers">
      <div className="dwHeader">
        <span className="dwPart">{boundLabel}</span>
        <span className="dwTotal">{`running total = ${step.total ?? 0}`}</span>
      </div>
      <div className="dwRow" aria-label="Digits of the bound">
        {digits.split("").map((d, i) => {
          const cls = i < pos ? "dwFixed" : i === pos ? "dwCurrent" : "dwFree";
          return (
            <span key={i} className={`dwDigit ${cls}`}>
              <small>{i === pos ? "here" : i < pos ? "fixed" : ""}</small>
              {d}
            </span>
          );
        })}
      </div>
      <div className="dwRow">
        <span className="dwLabel">used</span>
        {used.length === 0 ? <span className="dwNone">none yet</span> : used.map((d) => <span key={d} className="dwChip dwUsed">{d}</span>)}
      </div>
      <div className="dwRow">
        <span className="dwLabel">smaller unused</span>
        {cands.length === 0 ? <span className="dwNone">none</span> : cands.map((d) => <span key={d} className="dwChip dwCand">{d}</span>)}
        {step.added > 0 ? <span className="dwAdded">{`+${step.added}`}</span> : null}
      </div>
      {step.stopped ? <p className="dwStop" role="status">A repeated digit stops this bound's walk.</p> : null}
      <p className="dwNote">
        Each smaller digit fixes the prefix, and the remaining places can take any arrangement of unused digits.
      </p>
    </div>
  );
}
