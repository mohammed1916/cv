import "./MinCostStringView.css";

// The target is a letter strip with a cursor at position i. Below it, one cell per prefix length holds the
// cheapest known cost to build that prefix; a word that matches at the cursor draws a bracket over its letters.
export default function MinCostStringView({ run, step }) {
  if (!run || !step) return <p className="mcs-empty">Press Play to watch the prefix costs fill in.</p>;
  const { target, words, costs } = run.input;
  const { i, k, matched, updated, best } = step;
  const matchLength = k >= 0 && matched ? words[k].length : 0;
  const fmt = v => (v === Infinity ? "-" : String(v));

  return (
    <section className="mcs-view" aria-label="Minimum cost string construction">
      <div className="mcs-strip" role="img" aria-label={`Target ${target}`}>
        {[...target].map((ch, p) => {
          const inWord = i >= 0 && k >= 0 && matched && p >= i && p < i + matchLength;
          return (
            <div key={p} className={`mcs-letter${inWord ? " mcs-letter--word" : ""}${p === i ? " mcs-letter--cursor" : ""}`}>
              <span className="mcs-letter__char">{ch}</span>
              <span className="mcs-letter__index">{p}</span>
            </div>
          );
        })}
      </div>
      <div className="mcs-cells" aria-label="Cheapest cost for each prefix length">
        {best.map((value, p) => {
          const cls = [
            "mcs-cell",
            value === Infinity ? "mcs-cell--unreachable" : "",
            p === i ? "mcs-cell--source" : "",
            updated === p ? "mcs-cell--updated" : "",
            i >= 0 && k >= 0 && matched && p === i + matchLength ? "mcs-cell--target" : "",
          ].filter(Boolean).join(" ");
          return (
            <div key={p} className={cls}>
              <span className="mcs-cell__index">{p}</span>
              <strong className="mcs-cell__value">{fmt(value)}</strong>
            </div>
          );
        })}
      </div>
      <ul className="mcs-words" aria-label="Words and costs">
        {words.map((word, w) => (
          <li key={w} className={`mcs-word${w === k && i >= 0 ? (matched ? " mcs-word--match" : " mcs-word--miss") : ""}`}>
            <span>{word}</span>
            <span className="mcs-word__cost">cost {costs[w]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
