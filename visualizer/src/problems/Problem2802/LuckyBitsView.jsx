import "./LuckyBitsView.css";

// Binary of k + 1 as cells. The leading 1 is dropped, each remaining bit picks a digit (0 -> 4, 1 -> 7),
// and a strip of the lucky numbers in order shows where the answer sits.
export default function LuckyBitsView({ run, step }) {
  if (!run || !step) {
    return <section className="lb-view" aria-label="K-th lucky number"><p className="lb-empty">Press Play to turn k + 1 into lucky digits.</p></section>;
  }
  const { k, bits } = run;
  const shown = [];
  for (let len = 1; shown.length < Math.min(k, 14); len++) {
    for (let mask = 0; mask < 2 ** len && shown.length < Math.min(k, 14); mask++) {
      let text = "";
      for (let p = len - 1; p >= 0; p--) text += (mask >> p) & 1 ? "7" : "4";
      shown.push(text);
    }
  }
  const mapped = bits.slice(1).split("");
  const done = step.digits.length;
  return (
    <section className="lb-view" aria-label="Binary bits mapped to lucky digits">
      <p className="lb-line">k = {k}, so k + 1 = {step.m} = <code>{bits}</code> in binary.</p>
      <div className="lb-row" aria-label="Binary cells">
        {bits.split("").map((bit, i) => (
          <div key={i} className={`lb-cell ${i === 0 ? "lb-cell--lead" : ""} ${step.next === i ? "lb-cell--now" : ""}`}>
            <span className="lb-tag">{i === 0 ? "leading" : `bit ${i}`}</span>
            <span className="lb-bit">{bit}</span>
          </div>
        ))}
      </div>
      <div className="lb-row" aria-label="Digits chosen">
        {mapped.map((bit, i) => (
          <div key={i} className={`lb-map ${i < done ? "lb-map--set" : ""} ${step.next === i + 1 ? "lb-map--now" : ""}`}>
            <span className="lb-arrow">{bit === "0" ? "0 → 4" : "1 → 7"}</span>
            <span className="lb-digit">{i < done ? step.digits[i] : "?"}</span>
          </div>
        ))}
      </div>
      <p className="lb-built">Digits so far: <b>{step.digits || "none"}</b></p>
      <div className="lb-list" aria-label="Lucky numbers in order">
        {shown.map((text, i) => (
          <span key={text + i} className={`lb-item ${i + 1 === k ? "lb-item--target" : ""}`} title={`position ${i + 1}`}>{text}</span>
        ))}
        {k > 14 && <span className="lb-muted">… up to position {k}</span>}
      </div>
    </section>
  );
}
