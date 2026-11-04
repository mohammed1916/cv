import "./CapacityLineView.css";

const STAGES = [
  { id: "load", label: "FROM Buses, Passengers" },
  { id: "order", label: "ROW_NUMBER: buses in arrival order" },
  { id: "board", label: "LEAST(boarded + capacity, arrived)" },
  { id: "done", label: "Difference per bus, ORDER BY bus_id" },
];
const STAGE_OF = { load: 0, order: 1, board: 2, done: 3 };

// Top: the SQL stage strip with the active clause marked.
// Middle: buses in arrival order; the bar shows seats taken out of capacity.
// Each bus shows how many passengers had arrived by its time and how many are still waiting after it leaves.
export default function CapacityLineView({ run, step }) {
  const rows = step.rows ?? [];
  const stage = STAGE_OF[step.phase] ?? 0;
  const current = step.phase === "board" ? rows.at(-1) : undefined;
  const totalPassengers = run.input.Passengers.length;
  const boarded = step.phase === "board" ? rows.reduce((sum, row) => sum + row.passengers_cnt, 0) : 0;
  const leftAfter = step.phase === "board" ? (current.arrived - boarded) : undefined;

  return (
    <div className="capacity-view" aria-label="Buses taking waiting passengers up to capacity">
      <ol className="capacity-view__stages" aria-label="SQL stages">
        {STAGES.map((item, index) => (
          <li key={item.id} className={`capacity-view__stage${index === stage ? " is-active" : ""}`}
            aria-current={index === stage ? "step" : undefined}>{item.label}</li>
        ))}
      </ol>

      <div className="capacity-view__list">
        {rows.map(row => {
          const cap = row.capacity ?? 0;
          const taken = row.passengers_cnt ?? 0;
          const share = cap > 0 ? Math.min(100, Math.round((taken / cap) * 100)) : 0;
          const isNow = current && row.bus_id === current.bus_id && row.arrival_time === current.arrival_time;
          return (
            <section key={`${row.bus_id}-${row.arrival_time}-${row.seq ?? ""}`} className={`capacity-view__bus${isNow ? " is-now" : ""}`}>
              <header>
                <strong>{row.seq !== undefined ? `#${row.seq} · ` : ""}Bus {row.bus_id}</strong>
                <small>arrives {row.arrival_time}</small>
              </header>
              <div className="capacity-view__bar" role="img" aria-label={`${taken} of ${cap} seats taken`}>
                <span style={{ width: `${share}%` }} />
              </div>
              <footer>
                <span>capacity {cap}</span>
                {row.arrived !== undefined && <span>arrived {row.arrived}</span>}
                {row.passengers_cnt !== undefined && <span>takes {taken}</span>}
              </footer>
            </section>
          );
        })}
      </div>

      {step.phase === "board" && (
        <p className="capacity-view__queue">
          After bus {current.bus_id}: {leftAfter} passenger{leftAfter === 1 ? "" : "s"} still waiting out of {totalPassengers} in total.
        </p>
      )}
    </div>
  );
}
