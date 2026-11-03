import "./LeftmostOneView.css";

export default function LeftmostOneView({ run, step }) {
  const matrix = run?.input?.matrix ?? [];
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const row = step?.row ?? 0;
  const col = step?.col ?? cols - 1;
  const best = step?.best ?? -1;
  const inside = row < rows && col >= 0;
  const done = step?.phase === "done";
  const probed = new Map((step?.probes ?? []).map(p => [`${p.row},${p.col}`, p]));
  const lastProbe = step?.probes?.length ? step.probes[step.probes.length - 1] : null;

  return (
    <div className="leftmost-view">
      <div className="leftmost-grid-wrap" aria-label="Binary matrix probe walk">
        <div className="leftmost-line leftmost-head-line">
          <div className="leftmost-rowhead leftmost-spacer" aria-hidden="true" />
          {Array.from({ length: cols }, (_, c) => (
            <div key={`h${c}`} className={`leftmost-colhead ${best === c ? "is-best" : ""} ${inside && col === c ? "is-col" : ""}`}>
              <span className="leftmost-tag">{best === c ? "best" : inside && col === c ? "col" : ""}</span>
              <span className="leftmost-index">{c}</span>
            </div>
          ))}
        </div>
        {matrix.map((cells, r) => (
          <div key={`r${r}`} className="leftmost-line">
            <div className={`leftmost-rowhead ${inside && row === r ? "is-row" : ""}`}>
              <span className="leftmost-tag">{inside && row === r ? "row" : ""}</span>
              <span className="leftmost-index">{r}</span>
            </div>
            {cells.map((value, c) => {
              const key = `${r},${c}`;
              const seen = probed.get(key);
              const isCursor = inside && row === r && col === c && !done;
              const isLast = lastProbe && lastProbe.row === r && lastProbe.col === c;
              const cls = [
                "leftmost-cell",
                value === 1 ? "is-one" : "is-zero",
                seen ? "is-probed" : "",
                isCursor ? "is-cursor" : "",
                isLast ? "is-last" : "",
              ].filter(Boolean).join(" ");
              return (
                <div key={key} className={cls} aria-label={`row ${r}, column ${c}, value ${value}${seen ? ", read" : ""}${isCursor ? ", cursor" : ""}`}>
                  <span className="leftmost-value">{value}</span>
                  {seen ? <span className="leftmost-seen">{seen.value === 1 ? "read 1" : "read 0"}</span> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <dl className="leftmost-status" aria-label="Walk status">
        <div><dt>Cursor</dt><dd>{inside ? `row ${row}, column ${col}` : "off the grid"}</dd></div>
        <div><dt>Best so far</dt><dd>{best === -1 ? "none yet" : `column ${best}`}</dd></div>
        <div><dt>get calls</dt><dd>{step?.probes?.length ?? 0}</dd></div>
      </dl>
      <p className="leftmost-legend">
        <span className="leftmost-key is-one-key">1</span> a one, <span className="leftmost-key is-zero-key">0</span> a zero,
        <span className="leftmost-key is-cursor-key">outlined</span> the cursor, <span className="leftmost-key is-probed-key">dotted</span> a cell already read.
      </p>
    </div>
  );
}
