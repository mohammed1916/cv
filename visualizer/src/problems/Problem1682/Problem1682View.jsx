import "./LayerWindowView.css";

// The string as tiles. The window l..r is shaded, its end points carry l and r tags,
// the chosen outer pair is filled, and the memo table lists every solved window.
export default function Problem1682View({ run, step }) {
  const s = run.input;
  const [pi, pj] = step.pair || [];
  const hasWindow = step.l !== undefined && step.r !== undefined;
  return (
    <section className="lps2-view" aria-label="Layer window over the string">
      <div className="lps2-tiles">
        {[...s].map((ch, k) => {
          const inWindow = hasWindow && k >= step.l && k <= step.r;
          const isPair = k === pi || k === pj;
          const cls = ["lps2-tile"];
          if (inWindow) cls.push("lps2-tile--window");
          if (isPair) cls.push("lps2-tile--pair");
          return (
            <div key={k} className={cls.join(" ")}>
              {hasWindow && k === step.l && <span className="lps2-tag" style={{ left: 2 }}>l</span>}
              {hasWindow && k === step.r && <span className="lps2-tag" style={{ right: 2 }}>r</span>}
              {ch}
              <small>{k}</small>
            </div>
          );
        })}
      </div>
      <div className="lps2-facts">
        <span>Window: <strong>{hasWindow ? `${step.l}..${step.r}` : "whole string"}</strong></span>
        <span>Forbidden outer letter: <strong>{step.prev === "" ? "none" : step.prev}</strong></span>
        <span>Best here: <strong>{step.best}</strong> layer{step.best === 1 ? "" : "s"}</span>
        <span>Solved windows: <strong>{step.memoSize}</strong></span>
      </div>
      <table className="lps2-table" aria-label="Solved windows">
        <thead><tr><th>l</th><th>r</th><th>forbidden</th><th>layers</th></tr></thead>
        <tbody>
          {(step.memo ?? []).length === 0 && <tr><td colSpan={4}>nothing solved yet</td></tr>}
          {(step.memo ?? []).map(entry => {
            const current = hasWindow && entry.l === step.l && entry.r === step.r && entry.prev === step.prev;
            return (
              <tr key={`${entry.l},${entry.r},${entry.prev}`} className={current ? "is-current" : undefined}>
                <td>{entry.l}</td>
                <td>{entry.r}</td>
                <td>{entry.prev === "" ? "none" : entry.prev}</td>
                <td>{entry.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="lps2-message">{step.message}</p>
    </section>
  );
}
