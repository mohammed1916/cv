import "./ElevatorShaftView.css";

// Floors run up a shaft. Each request is a marker showing its floor and its earliest arrival time.
// The current transition is drawn as an arrow from the last served request to the next one.
export default function ElevatorShaftView({ run, step }) {
  if (!run || !step) return <p className="es-empty">Press Play to order the requests on the shaft.</p>;
  const { start, requests } = run.input;
  const floors = [...requests.map(r => r[1]), start];
  const top = Math.max(...floors) + 1;
  const bottom = Math.min(...floors) - 1;
  const rows = top - bottom + 1;
  const y = f => 16 + (top - f) * 22;
  const m = requests.length;
  const from = step.last >= 0 ? requests[step.last][1] : start;
  const to = step.nxt >= 0 ? requests[step.nxt][1] : null;
  return (
    <section className="es-view" aria-label="Elevator shaft and request table">
      <svg viewBox={`0 0 300 ${y(bottom) + 26}`} role="img" aria-label={`Elevator at floor ${from}`}>
        {Array.from({ length: rows }, (_, k) => top - k).map(f => (
          <g key={f}>
            <line x1="60" x2="240" y1={y(f)} y2={y(f)} className="es-floor" />
            <text x="48" y={y(f) + 4} textAnchor="end" className="es-floor-label">{f}</text>
          </g>
        ))}
        <line x1="150" x2="150" y1={y(top)} y2={y(bottom)} className="es-shaft" />
        {requests.map(([a, f], i) => (
          <g key={i} className={step.mask & (1 << i) ? "es-req es-req--done" : "es-req"}>
            <circle cx="150" cy={y(f)} r="7" />
            <text x={i % 2 ? 176 : 124} y={y(f) + 4} textAnchor={i % 2 ? "start" : "end"}>{`#${i} from t${a}`}</text>
          </g>
        ))}
        <circle cx="150" cy={y(from)} r="11" className="es-elevator" />
        {to !== null && <line x1="150" x2="150" y1={y(from)} y2={y(to)} className="es-move" />}
      </svg>
      <table className="es-table" aria-label="Earliest finish table">
        <caption>Earliest time for each served set (rows: mask, columns: last request)</caption>
        <thead><tr><th>mask</th>{Array.from({ length: m }, (_, i) => <th key={i}>last {i}</th>)}</tr></thead>
        <tbody>
          {step.table.map((row, mask) => (
            mask === 0 ? null : <tr key={mask} className={mask === step.mask ? "es-row--current" : ""}>
              <th>{mask.toString(2).padStart(m, "0")}</th>
              {row.map((v, i) => <td key={i}>{v === null ? "-" : v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="es-readout">{step.arrive === null ? "Waiting to seed" : `Current candidate time ${step.arrive}${step.improved ? " (kept)" : ""}`}</p>
    </section>
  );
}
