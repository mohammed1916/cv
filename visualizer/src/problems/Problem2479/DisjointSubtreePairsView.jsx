import "./DisjointSubtreePairsView.css";

const R = 20;
const X_GAP = 60;
const Y_GAP = 80;
const PAD = 36;

function treeLayout(n, parent) {
  const kids = Array.from({ length: n }, () => []);
  for (let v = 0; v < n; v++) if (parent[v] !== -1) kids[parent[v]].push(v);
  const pos = {};
  let next = 0;
  const place = (v, depth) => {
    if (!kids[v].length) pos[v] = { x: next++, y: depth };
    else {
      kids[v].forEach(c => place(c, depth + 1));
      const xs = kids[v].map(c => pos[c].x);
      pos[v] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth };
    }
  };
  place(0, 0);
  return pos;
}

export default function DisjointSubtreePairsView({ run, step }) {
  if (!run || !step) {
    return <section className="disjoint-view" aria-label="Disjoint subtree pairs"><p className="disjoint-empty">Press Play to test each pair of nodes.</p></section>;
  }
  const { values, edges } = run.input;
  const n = values.length;
  const parent = Array(n).fill(-1);
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  const order = [0];
  for (let i = 0; i < order.length; i++) for (const w of adj[order[i]]) if (w !== parent[order[i]] && w !== 0 && parent[w] === -1) { parent[w] = order[i]; order.push(w); }
  const pos = treeLayout(n, parent);
  const cols = Math.max(...Object.values(pos).map(p => p.x)) + 1;
  const rows = Math.max(...Object.values(pos).map(p => p.y)) + 1;
  const width = PAD * 2 + Math.max(1, cols - 1) * X_GAP;
  const height = PAD * 2 + (rows - 1) * Y_GAP;
  const X = v => PAD + pos[v].x * X_GAP;
  const Y = v => PAD + pos[v].y * Y_GAP;
  const [pu, pv] = step.pair || [];
  return (
    <section className="disjoint-view" aria-label="Disjoint subtree pairs">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tree with subtree sums">
        {edges.map(([a, b], k) => {
          const child = parent[a] === b ? a : b, par = child === a ? b : a;
          return <line key={k} x1={X(par)} y1={Y(par)} x2={X(child)} y2={Y(child)} className="disjoint-edge" />;
        })}
        {Array.from({ length: n }, (_, v) => (
          <g key={v} className={`disjoint-node${v === pu || v === pv ? " disjoint-node--pair" : ""}${v === step.node ? " disjoint-node--active" : ""}`}>
            <circle cx={X(v)} cy={Y(v)} r={R} />
            <text x={X(v)} y={Y(v) - 2} className="disjoint-id">{v}</text>
            <text x={X(v)} y={Y(v) + 10} className="disjoint-sum">{step.sums ? step.sums[v] : values[v]}</text>
          </g>
        ))}
      </svg>
      <p className="disjoint-legend">Circles show node number (top) and subtree sum (bottom). Amber nodes are the pair under test.</p>
      <table className="disjoint-table">
        <thead><tr><th>pair</th><th>result</th><th>best</th></tr></thead>
        <tbody>
          {step.candidates.map(c => (
            <tr key={`${c.u}-${c.v}`} className={pu === c.u && pv === c.v ? "disjoint-row--active" : ""}>
              <td>{c.u}, {c.v}</td>
              <td>{c.related ? "ancestor, skipped" : `XOR ${c.xor}`}</td>
              <td>{step.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
