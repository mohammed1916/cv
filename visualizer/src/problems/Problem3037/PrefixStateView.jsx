import "./PrefixStateView.css";

// Shows the pattern with its failure table under it, the matched-prefix pointer, and the bits read so far.
export default function PrefixStateView({ run, step }) {
  const pattern = run.input.pattern;
  const m = pattern.length;
  const bits = step.bits ?? "";
  const state = step.state ?? 0;
  const tableI = step.i ?? -1;
  const lastBit = bits.length ? bits[bits.length - 1] : null;

  return (
    <div className="prefixState" aria-label="Failure table and matched prefix">
      <div className="psRow">
        <span className="psLabel">pattern</span>
        {pattern.split("").map((bit, i) => (
          <span
            key={i}
            className={[
              "psCell",
              i < state ? "psMatched" : "",
              i === state && state < m ? "psNext" : "",
              i === tableI ? "psTable" : "",
            ].join(" ")}
          >
            <small>{i}</small>
            {bit}
          </span>
        ))}
      </div>
      <div className="psRow">
        <span className="psLabel">fail</span>
        {(step.fail ?? []).map((v, i) => (
          <span key={i} className={`psCell psFail ${i === tableI ? "psTable" : ""}`}>
            {v === null ? "?" : v}
          </span>
        ))}
      </div>
      <div className="psRow psTape">
        <span className="psLabel">stream</span>
        {bits.split("").map((bit, i) => (
          <span key={i} className={`psCell psBit ${i === bits.length - 1 ? "psLast" : ""}`}>
            {bit}
          </span>
        ))}
      </div>
      <p className="psStatus">
        {`matched prefix length = ${state} of ${m}`}
        {lastBit !== null ? `, last bit = ${lastBit}` : ""}
        {tableI >= 0 ? `, building fail[${tableI}]` : ""}
      </p>
      <p className="psNote">
        A mismatch never rereads a bit: the failure table says which shorter prefix still matches the bits just read.
      </p>
    </div>
  );
}
