import "./SubtreeColorView.css";

const PALETTE = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4d7c0f", "#374151"];
const COL_W = 64;
const ROW_H = 80;
const PAD = 40;

// Lay out the rooted tree: leaves get consecutive columns, parents sit over the middle of their children.
function layout(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const pos = {};
  const depth = {};
  const parent = {};
  let column = 0;
  const place = (v, up, d) => {
    depth[v] = d;
    parent[v] = up;
    const kids = adj[v].filter(c => c !== up);
    if (kids.length === 0) {
      pos[v] = column++;
      return pos[v];
    }
    const xs = kids.map(c => place(c, v, d + 1));
    pos[v] = (Math.min(...xs) + Math.max(...xs)) / 2;
    return pos[v];
  };
  place(0, -1, 0);
  return { pos, depth, adj, parent };
}

export default function SubtreeColorView({ run, step }) {
  if (!run || !step) {
    return <section className="sc-view" aria-label="Monochrome subtree tree"><p className="sc-empty">Press Play to walk the tree from node 0.</p></section>;
  }
  const { colors, edges } = run.input;
  const n = colors.length;
  const { pos, depth, parent, adj } = layout(n, edges);
  const maxDepth = Math.max(...Object.values(depth));
  const width = PAD * 2 + Math.max(1, Math.max(...Object.values(pos)) + 1) * COL_W;
  const height = PAD * 2 + maxDepth * ROW_H;
  const X = v => PAD + pos[v] * COL_W + COL_W / 2;
  const Y = v => PAD + depth[v] * ROW_H;

  const results = step.results;
  const bestNode = Object.keys(results).find(k => results[k].same && results[k].size === step.best);
  const bestSet = new Set();
  if (bestNode !== undefined && step.best > 0) {
    const top = Number(bestNode);
    // The best subtree is every node whose ancestor chain reaches the top node.
    for (let v = 0; v < n; v++) {
      let u = v;
      while (u !== undefined && u !== top && parent[u] !== undefined && parent[u] !== -1) u = parent[u];
      if (u === top) bestSet.add(v);
    }
  }

  const edgeLines = edges.map(([a, b]) => {
    const [p, c] = depth[a] < depth[b] ? [a, b] : [b, a];
    const active = (step.node === p && step.child === c) || (step.node === c && step.child === p);
    return <line key={`${a}-${b}`} x1={X(p)} y1={Y(p)} x2={X(c)} y2={Y(c)} className={`sc-edge${active ? " sc-edge--active" : ""}`} />;
  });

  return (
    <section className="sc-view" aria-label="Monochrome subtree tree">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Tree with ${n} nodes, best subtree ${step.best}`}>
        {edgeLines}
        {Array.from({ length: n }, (_, v) => {
          const done = results[v];
          const current = v === step.node;
          const mono = done && done.same;
          const cls = ["sc-node"];
          if (current) cls.push("sc-node--current");
          if (bestSet.has(v)) cls.push("sc-node--best");
          if (done && !mono) cls.push("sc-node--mixed");
          return (
            <g key={v} className={cls.join(" ")}>
              <circle cx={X(v)} cy={Y(v)} r={22} fill={PALETTE[(colors[v] - 1) % PALETTE.length]} />
              <text x={X(v)} y={Y(v) + 5} textAnchor="middle" className="sc-id">{`${v}`}</text>
              <text x={X(v)} y={Y(v) + 40} textAnchor="middle" className="sc-meta">
                {done ? `size ${done.size}${mono ? " mono" : " mixed"}` : `colour ${colors[v]}`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="sc-legend">
        <span><i className="sc-swatch sc-swatch--best" /> best subtree so far</span>
        <span><i className="sc-swatch sc-swatch--current" /> current node</span>
        <span><i className="sc-swatch sc-swatch--mixed" /> subtree mixes colours</span>
      </div>
      <output aria-label="Best size" className="sc-best">{`Best monochrome subtree: ${step.best}`}</output>
    </section>
  );
}
