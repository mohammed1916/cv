import "./WindowDpView.css";

const cell = (ch, i, cls) => (
  <div key={i} className={`wdp__cell ${cls}`}>
    <span className="wdp__index">{i}</span>
    <span className="wdp__char">{ch}</span>
  </div>
);

export default function WindowDpView({ run, step }) {
  if (!run || !step) return null;
  const { source, target } = run.input;
  const [from, to] = step.window ?? [-1, -1];
  const inWindow = i => from >= 0 && i >= from && i <= to;
  const tone = step.phase === "apply" ? "wdp__cell--apply" : step.phase === "reject" ? "wdp__cell--reject" : "";
  return (
    <div className="wdp" role="img" aria-label={`Convert ${source} to ${target}`}>
      <div className="wdp__row">
        <span className="wdp__label">source</span>
        {[...source].map((ch, i) => cell(ch, i, [inWindow(i) ? "wdp__cell--window" : "", i === step.at ? "wdp__cell--at" : ""].join(" ")))}
      </div>
      <div className="wdp__row">
        <span className="wdp__label">target</span>
        {[...target].map((ch, i) => cell(ch, i, inWindow(i) ? `wdp__cell--window ${tone}` : ""))}
      </div>
      <div className="wdp__row wdp__row--dp">
        <span className="wdp__label">dp</span>
        {step.dp.map((v, i) => (
          <div key={i} className={`wdp__dp${i === step.at + 1 || (step.phase === "apply" && i === (to + 1)) ? " wdp__dp--hit" : ""}`}>
            <span className="wdp__index">{i}</span>
            <strong>{v === null ? "inf" : v}</strong>
          </div>
        ))}
      </div>
      <div className="wdp__legend">
        {step.rule && <span>Rule <strong>{step.rule}</strong></span>}
        <span>Phase: {step.phase}</span>
      </div>
    </div>
  );
}
