import "./ChainTableView.css";

// Values sit in order with a cursor on the current one. Two tables hold the chains seen so far:
// rising chains (keyed by the value they end on) and falling chains. The current value looks up
// the entries one below (rising) and one above (falling) to build its own chains.
export default function ChainTableView({ run, step }) {
  if (!run || !step) return <p className="ctv-empty">Press Play to follow each value through the chain tables.</p>;
  const nums = run.input;
  const { maps, lookupUp, lookupDown, v, i } = step;

  return (
    <section className="ctv-view" aria-label="Chains of consecutive subsequences">
      <div className="ctv-strip" role="list" aria-label="Values in order">
        {nums.map((x, p) => (
          <div key={p} role="listitem" className={`ctv-cell${p === i ? " ctv-cell--current" : ""}${p < i ? " ctv-cell--seen" : ""}`}>
            {x}
          </div>
        ))}
      </div>
      <div className="ctv-tables">
        <Table title="Rising chains (+1 steps)" entries={maps.up} lookup={lookupUp} note={v !== null && lookupUp ? `looks up ${lookupUp.value}` : null} />
        <Table title="Falling chains (−1 steps)" entries={maps.down} lookup={lookupDown} note={v !== null && lookupDown ? `looks up ${lookupDown.value}` : null} />
      </div>
      <div className="ctv-readout" aria-label="Current value contributions">
        {v !== null && step.cu !== null ? (
          <>
            <span>rising: count {step.cu}, sum {step.su}</span>
            <span>falling: count {step.cd}, sum {step.sd}</span>
          </>
        ) : (
          <span>{step.phase === "done" ? "Every value has been processed." : "Waiting for the first value."}</span>
        )}
        <strong>total {step.total}</strong>
      </div>
    </section>
  );
}

function Table({ title, entries, lookup, note }) {
  return (
    <div className="ctv-table">
      <span className="ctv-table__title">{title}</span>
      {note && <span className="ctv-table__note">{note}</span>}
      <table>
        <thead><tr><th scope="col">value</th><th scope="col">count</th><th scope="col">sum</th></tr></thead>
        <tbody>
          {entries.length === 0 && <tr><td colSpan={3}>none yet</td></tr>}
          {entries.map(entry => (
            <tr key={entry.value} className={lookup && lookup.value === entry.value ? "ctv-row--lookup" : ""}>
              <td>{entry.value}</td><td>{entry.count}</td><td>{entry.sum}</td>
            </tr>
          ))}
          {lookup && !entries.some(e => e.value === lookup.value) && (
            <tr className="ctv-row--lookup"><td>{lookup.value}</td><td>0</td><td>0</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
