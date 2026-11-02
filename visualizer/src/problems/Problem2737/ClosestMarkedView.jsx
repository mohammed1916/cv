import "./ClosestMarkedView.css";

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 125;
const NODE = 20;

// Vertices sit on a circle so every edge and its weight stays readable.
function position(index, total) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
}

function nodeClass(v, step, markedSet) {
  if (step.current === v) return "cm-node cm-node--current";
  if (step.phase === "found" && step.current === v) return "cm-node cm-node--found";
  if (step.settled[v]) return markedSet.has(v) ? "cm-node cm-node--marked-settled" : "cm-node cm-node--settled";
  return markedSet.has(v) ? "cm-node cm-node--marked" : "cm-node cm-node--open";
}

export default function ClosestMarkedView({ run, step }) {
  if (!run || !step) {
    return <section className="cm-view" aria-label="Closest marked node"><p className="cm-empty">Press Play to run Dijkstra from the start vertex.</p></section>;
  }
  const { n, edges, s, marked, answer } = run;
  const markedSet = new Set(marked);
  const pos = Array.from({ length: n }, (_, v) => position(v, n));
  const relax = step.relax;

  return (
    <section className="cm-view" aria-label="Closest marked node by Dijkstra">
      <header className="cm-head">
        <span className="cm-chip">start = {s}</span>
        <span className="cm-chip">marked = {marked.length ? marked.join(", ") : "none"}</span>
        <span className="cm-chip cm-chip--strong">{step.answer !== null && step.answer !== undefined ? `answer ${step.answer}` : "answer pending"}</span>
      </header>
      <div className="cm-body">
        <svg className="cm-graph" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Directed weighted graph">
          <defs>
            <marker id="cm-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="cm-arrowhead" />
            </marker>
            <marker id="cm-arrow-hot" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="cm-arrowhead cm-arrowhead--hot" />
            </marker>
          </defs>
          {edges.map(([u, v, w], index) => {
            const a = pos[u], b = pos[v];
            const hot = relax && relax.from === u && relax.to === v;
            const dx = b.x - a.x, dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const sx = a.x + (dx / len) * NODE, sy = a.y + (dy / len) * NODE;
            const ex = b.x - (dx / len) * NODE, ey = b.y - (dy / len) * NODE;
            return (
              <g key={`e${index}`} className={hot ? "cm-edge cm-edge--hot" : "cm-edge"}>
                <line x1={sx} y1={sy} x2={ex} y2={ey} markerEnd={hot ? "url(#cm-arrow-hot)" : "url(#cm-arrow)"} />
                <text x={(sx + ex) / 2 + 6} y={(sy + ey) / 2 - 4}>{w}</text>
              </g>
            );
          })}
          {Array.from({ length: n }, (_, v) => {
            const p = pos[v];
            const d = step.dist[v];
            return (
              <g key={`n${v}`} className={nodeClass(v, step, markedSet)}>
                <circle cx={p.x} cy={p.y} r={NODE} />
                {markedSet.has(v) && <circle className="cm-ring" cx={p.x} cy={p.y} r={NODE + 5} />}
                <text className="cm-id" x={p.x} y={p.y + 5}>{v}</text>
                <text className="cm-dist" x={p.x} y={p.y + NODE + 14}>{d === null ? "∞" : `d=${d}`}</text>
              </g>
            );
          })}
        </svg>
        <table className="cm-table" aria-label="Vertex distances">
          <thead><tr><th>Vertex</th><th>Distance</th><th>State</th></tr></thead>
          <tbody>
            {Array.from({ length: n }, (_, v) => (
              <tr key={v} className={step.current === v ? "cm-row--current" : undefined}>
                <td>{v}{markedSet.has(v) ? " (marked)" : ""}</td>
                <td>{step.dist[v] === null ? "∞" : step.dist[v]}</td>
                <td>{step.current === v ? "settling" : step.settled[v] ? "settled" : step.dist[v] === null ? "unreached" : "open"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {relax && (
        <p className="cm-relax">
          Edge {relax.from} to {relax.to} (weight {relax.w}) offers {relax.candidate}.{" "}
          {relax.improves ? "Shorter, so the distance is updated." : "Not shorter, so nothing changes."}
        </p>
      )}
      {step.phase === "done" && <p className="cm-answer">Final answer: {answer}</p>}
    </section>
  );
}
