import "./DecodeSplitView.css";

// Each encoded value is cut into three coloured parts: the width digit, x, and y.
// A bit ladder under the current row shows the squaring walk that computes x^y mod 1000000007.
export default function DecodeSplitView({ run, step }) {
  if (!run || !step) {
    return <section className="ds-view" aria-label="Decoded numbers"><p className="ds-empty">Press Play to split each code and raise x to y.</p></section>;
  }
  const { nums } = run;
  const current = step.index;
  const power = step.power;
  const bitsOfY = step.y !== null ? Number(BigInt(step.y)).toString(2).split("").reverse() : [];

  return (
    <section className="ds-view" aria-label="Encoded values split into x and y">
      <ol className="ds-rows">
        {nums.map((e, i) => {
          const text = String(e);
          const width = Number(text.slice(-1));
          const body = text.slice(0, -1);
          const x = body.slice(0, width);
          const y = body.slice(width);
          return (
            <li key={i} className={`ds-row ${i === current ? "ds-row--current" : ""} ${i < current ? "ds-row--done" : ""}`}>
              <span className="ds-code" aria-label={`encoded ${text}`}>
                <span className="ds-x">{x}</span>
                <span className="ds-y">{y}</span>
                <span className="ds-w">{width}</span>
              </span>
              <span className="ds-meaning">x = {x}, y = {y}, width {width}</span>
            </li>
          );
        })}
      </ol>
      <div className="ds-legend">
        <span><i className="ds-key ds-key--x" /> x: first width digits</span>
        <span><i className="ds-key ds-key--y" /> y: remaining digits</span>
        <span><i className="ds-key ds-key--w" /> last digit = width</span>
      </div>
      {power && (
        <div className="ds-power" aria-label="Squaring walk">
          <h4>Squaring walk for {step.x}^{step.y} mod 1000000007</h4>
          <div className="ds-ladder">
            <table>
              <tbody>
                <tr><th>exponent left</th><td>{power.exp}</td></tr>
                <tr><th>base</th><td>{power.base ?? "-"}</td></tr>
                <tr><th>result</th><td>{power.result}</td></tr>
                <tr><th>bit</th><td>{power.bit === null ? "-" : power.bit}</td></tr>
              </tbody>
            </table>
            <div className="ds-bits" aria-label="Bits of y, least significant first">
              {bitsOfY.map((b, k) => <span key={k} className={`ds-bit ${b === "1" ? "ds-bit--on" : ""}`}>{b}</span>)}
            </div>
          </div>
        </div>
      )}
      <p className="ds-total">Running sum mod 1000000007: <b>{step.total}</b></p>
    </section>
  );
}
