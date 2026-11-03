import "./FontFitView.css";

export default function FontFitView({ run, step }) {
  const { sizes, w, h, text } = run.input;
  const unit = Math.min(4, 320 / Math.max(w, step.total ?? 0, 1));
  let x = 0;
  const glyphs = step.widths.map((width, i) => {
    const left = x;
    x += width;
    return { ch: text[i], left, width, over: x > w };
  });

  return (
    <div className="font-view">
      <ol className="font-ladder" aria-label="Font sizes in ascending order">
        {sizes.map((size, i) => {
          const cls = ["rung"];
          if (i === step.lo && step.lo >= 0) cls.push("is-lo");
          if (i === step.hi && step.hi >= 0) cls.push("is-hi");
          if (i === step.mid) cls.push("is-mid");
          if (i === step.ans) cls.push("is-answer");
          return (
            <li key={size} className={cls.join(" ")}>
              <span className="rung-size">{size}</span>
              <span className="rung-tags">
                {i === step.lo && step.lo >= 0 ? "lo " : ""}
                {i === step.mid ? "mid " : ""}
                {i === step.hi && step.hi >= 0 ? "hi" : ""}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="font-screen-wrap">
        <div className="font-screen" style={{ width: w * unit, height: h * unit }} role="img" aria-label={`Screen ${w} wide and ${h} high`}>
          <span className="font-screen-label">screen {w} x {h}</span>
          <div className="font-glyphs">
            {glyphs.map((g, i) => (
              <span
                key={i}
                className={`glyph ${g.over ? "is-over" : ""} ${g.ch === " " ? "is-space" : ""}`}
                style={{ left: g.left * unit, width: Math.max(2, g.width * unit - 1), height: step.size * unit }}
              >
                {g.ch === " " ? "" : g.ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      <output className="font-readout" aria-label="Measurement">
        {step.size === null
          ? "No font size measured yet."
          : `size ${step.size}: width ${step.total} of ${w}, height ${step.size} of ${h} (${step.verdict === "fit" ? "fits" : step.verdict === "miss" ? "does not fit" : "measuring"})`}
      </output>
    </div>
  );
}
