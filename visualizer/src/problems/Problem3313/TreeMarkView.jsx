import "./TreeMarkView.css";

// Nodes sit on a circle and the tree's edges are drawn between them. While a breadth-first search runs,
// each node shows its distance from the source; the two ends of the longest path are badged, and the
// answer for each node is written beside it once assigned.
export default function TreeMarkView({ run, step }) {
  if (!run || !step) return <p className="tmv-empty">Press Play to see the two far ends and the answer for each node.</p>;
  const { n, edges } = run.input;
  const size = 320;
  const r = n === 1 ? 0 : 118;
  const cx = size / 2;
  const cy = size / 2;
  const pos = i => ({ x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) });

  return (
    <section className="tmv-view" aria-label="Tree with farthest-node answers">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Tree with ${n} nodes`} className="tmv-svg">
        {edges.map(([a, b], k) => {
          const pa = pos(a);
          const pb = pos(b);
          return <line key={k} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className="tmv-edge" />;
        })}
        {Array.from({ length: n }, (_, i) => {
          const p = pos(i);
          const cls = [
            "tmv-node",
            i === step.first ? "tmv-node--first" : "",
            i === step.second ? "tmv-node--second" : "",
            step.source === i ? "tmv-node--source" : "",
            step.i === i ? "tmv-node--assign" : "",
          ].filter(Boolean).join(" ");
          const d = step.dist ? step.dist[i] : null;
          return (
            <g key={i} className={cls}>
              <circle cx={p.x} cy={p.y} r={17} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" className="tmv-node__id">{i}</text>
              {d !== null && d >= 0 && (
                <text x={p.x} y={p.y - 24} textAnchor="middle" className="tmv-node__dist">d={d}</text>
              )}
              {step.answer[i] !== null && (
                <text x={p.x} y={p.y + 32} textAnchor="middle" className="tmv-node__answer">→{step.answer[i]}</text>
              )}
            </g>
          );
        })}
      </svg>
      <ul className="tmv-legend" aria-label="Roles">
        <li><span className="tmv-key tmv-key--source" />BFS source</li>
        <li><span className="tmv-key tmv-key--first" />first end</li>
        <li><span className="tmv-key tmv-key--second" />second end</li>
      </ul>
      <p className="tmv-note">
        {step.source !== null ? `Distances shown from node ${step.source}.` : step.i >= 0 ? `Assigning node ${step.i}.` : "Ends and answers update as the sweeps finish."}
      </p>
    </section>
  );
}
