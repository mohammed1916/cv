import "./WindowCountView.css";
import PointerRail from "../../components/shared/PointerRail";

// Character tiles with the sliding window drawn as a bracket, the right end as a pointer,
// the substrings that end at the right end listed, and a running per-end bar chart.
export default function WindowCountView({ run, step }) {
  if (!run || !step) {
    return <section className="wc-view" aria-label="Substrings without repeats"><p className="wc-empty">Press Play to slide the window across the string.</p></section>;
  }
  const { s } = run;
  const { left, right, c, repeatAt, ends } = step;
  const maxEnd = Math.max(1, ...run.frames.map(frame => frame.ends.length ? Math.max(...frame.ends) : 0));
  const endedSubstrings = right >= 0 && right >= left
    ? Array.from({ length: right - left + 1 }, (_, k) => s.slice(left + k, right + 1))
    : [];

  return (
    <section className="wc-view" aria-label="Sliding window over the string">
      <div className="wc-strip" role="group" aria-label="String with window">
        {Array.from(s).map((ch, i) => {
          const inWindow = right >= 0 && i >= left && i <= right;
          const cls = ["wc-tile", inWindow ? "wc-tile--in" : "", i === right ? "wc-tile--right" : "", repeatAt === i ? "wc-tile--repeat" : ""].join(" ");
          return (
            <div key={i} className={cls}>
              <span className="wc-index">{i}</span>
              <span className="wc-char">{ch}</span>
              <span className="wc-pointer">{i === left && right >= 0 ? "L" : ""}{i === right ? (i === left ? "/R" : "R") : ""}</span>
            </div>
          );
        })}
      </div>
      {right >= 0 && <PointerRail title="Pointers on the string" values={Array.from(s)} pointers={[{ id: 'l', label: 'l', index: left, tone: 'primary' }, { id: 'r', label: 'r', index: right, tone: 'success' }]} />}
      <p className="wc-note">
        {right >= 0 ? <>Window [{left}..{right}] {c !== null && <>with new character <b>{c}</b></>}. </> : null}
        {repeatAt !== null && <span className="wc-warn">'{c}' was at {repeatAt}, so left jumps to {left}.</span>}
      </p>
      <div className="wc-ends">
        <h4>Substrings ending at index {right >= 0 ? right : "-"}</h4>
        <div className="wc-chips">
          {endedSubstrings.map((text, k) => <code key={k} className="wc-chip">{text}</code>)}
          {endedSubstrings.length === 0 && <span className="wc-muted">none yet</span>}
        </div>
      </div>
      <div className="wc-bars" aria-label="Count added per right end">
        {Array.from(s).map((ch, i) => {
          const value = ends[i];
          return (
            <div key={i} className="wc-bar-col">
              <div className="wc-bar" style={{ height: value ? `${(value / maxEnd) * 70}px` : "0px" }} title={value ? `${value} substrings end at ${i}` : "not yet"}>
                {value ? value : ""}
              </div>
              <span>{ch}</span>
            </div>
          );
        })}
      </div>
      <p className="wc-total">Running total: <b>{step.total}</b></p>
    </section>
  );
}
