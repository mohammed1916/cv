import "./LayerWindowView.css";

// The string as tiles: the current window l..r is blue, the chosen outer pair is violet, the forbidden outer letter is shown.
export default function Problem1682View({ run, step }) {
  const s = run.input;
  const [pi, pj] = step.pair || [];
  return (
    <section className="lps2-view" aria-label="Layer window over the string">
      <div className="lps2-tiles">
        {[...s].map((ch, k) => {
          const inWindow = step.l !== undefined && k >= step.l && k <= step.r;
          const isPair = k === pi || k === pj;
          const cls = ["lps2-tile"];
          if (inWindow) cls.push("lps2-tile--window");
          if (isPair) cls.push("lps2-tile--pair");
          return (
            <div key={k} className={cls.join(" ")}>
              {ch}
              <small>{k}</small>
            </div>
          );
        })}
      </div>
      <div className="lps2-facts">
        <span>Window: <strong>{step.l}..{step.r}</strong></span>
        <span>Forbidden outer letter: <strong>{step.prev === "" ? "none" : step.prev}</strong></span>
        <span>Best here: <strong>{step.best}</strong></span>
        <span>Memo entries: <strong>{step.memoSize}</strong></span>
      </div>
      <p className="lps2-message">{step.message}</p>
    </section>
  );
}
