import "./BusStationView.css";

const STAGES = [
  { id: "load", label: "FROM Buses, Passengers" },
  { id: "board", label: "JOIN each passenger to the first bus at or after arrival" },
  { id: "count", label: "GROUP BY bus_id, COUNT passengers" },
  { id: "done", label: "ORDER BY bus_id" },
];
const STAGE_OF = { load: 0, board: 1, count: 2, done: 3 };

// Top: the SQL stage strip, with the active clause marked.
// Middle: one column per bus in arrival order; a passenger chip sits in the bus they board.
// Bottom: passengers still waiting, which lists the arrivals not yet matched.
export default function BusStationView({ run, step }) {
  const buses = [...run.input.Buses].sort((a, b) => a.arrival_time - b.arrival_time);
  const passengers = run.input.Passengers;
  const finalBoarded = run.frames.filter(f => f.phase === "board").at(-1)?.rows ?? [];
  const boarded = step.phase === "board" ? step.rows : step.phase === "load" ? [] : finalBoarded;
  const newest = step.phase === "board" ? step.rows.at(-1)?.passenger_id : undefined;
  const boardedIds = new Set(boarded.map(row => row.passenger_id));
  const waiting = passengers.filter(p => !boardedIds.has(p.passenger_id));
  const counted = step.phase === "count" || step.phase === "done";

  return (
    <div className="bus-view" aria-label="Passengers boarding buses">
      <ol className="bus-view__stages" aria-label="SQL stages">
        {STAGES.map((stage, index) => (
          <li key={stage.id} className={`bus-view__stage${index === STAGE_OF[step.phase] ? " is-active" : ""}`}
            aria-current={index === STAGE_OF[step.phase] ? "step" : undefined}>{stage.label}</li>
        ))}
      </ol>

      <div className="bus-view__buses">
        {buses.map(bus => {
          const riders = boarded.filter(row => row.bus_time === bus.arrival_time);
          const total = step.phase === "done"
            ? step.rows.find(row => row.bus_id === bus.bus_id)?.passengers_cnt
            : counted ? step.rows.find(row => row.bus_id === bus.bus_id)?.passengers_cnt : undefined;
          return (
            <section key={bus.bus_id} className="bus-view__bus">
              <header><strong>Bus {bus.bus_id}</strong><small>arrives {bus.arrival_time}</small></header>
              <div className="bus-view__riders">
                {riders.length === 0 && <span className="bus-view__none">no riders yet</span>}
                {riders.map(row => (
                  <span key={row.passenger_id} className={`bus-view__chip${row.passenger_id === newest ? " is-new" : ""}`}>
                    #{row.passenger_id} <small>at {row.arrival_time}</small>
                  </span>
                ))}
              </div>
              <footer>{total !== undefined ? `passengers_cnt = ${total}` : `${riders.length} so far`}</footer>
            </section>
          );
        })}
      </div>

      <div className="bus-view__waiting">
        <span className="bus-view__label">Passengers not yet matched</span>
        {waiting.length === 0 && <span className="bus-view__none">all passengers matched</span>}
        {waiting.map(p => <span key={p.passenger_id} className="bus-view__chip bus-view__chip--wait">
          #{p.passenger_id} <small>arrives {p.arrival_time}</small>
        </span>)}
      </div>
    </div>
  );
}
