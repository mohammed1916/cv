import "./XorStateView.css";

// The current array is drawn as value tiles in binary. The XOR of every value is shown beneath,
// and the pair used for the latest replacement is outlined.
export default function XorStateView({ run, step }) {
  if (!run || !step) return <p className="xs-empty">Press Play to search the replacements level by level.</p>;
  const state = step.state || [];
  const total = step.total;
  const bits = v => v.toString(2).padStart(3, "0");
  return (
    <section className="xs-view" aria-label="Array state during the search">
      <p className="xs-caption">Depth {step.depth < 0 ? "none" : step.depth} · queue state sorted, values shown in binary</p>
      <ol className="xs-tiles" aria-label={`Array [${state.join(", ")}]`}>
        {state.map((v, i) => {
          const used = step.from && (step.from.i === i || step.from.j === i);
          return (
            <li key={i} className={used ? "xs-tile xs-tile--used" : "xs-tile"}>
              <span className="xs-dec">{v}</span>
              <span className="xs-bin">{bits(v)}</span>
            </li>
          );
        })}
      </ol>
      <p className="xs-xor" role="status">{total === null || total === undefined ? "No state" : `XOR of all values: ${total} (${bits(total)})${total === 0 ? " - goal reached" : ""}`}</p>
      {step.next && <p className="xs-next">New state: [{step.next.join(", ")}]</p>}
    </section>
  );
}
