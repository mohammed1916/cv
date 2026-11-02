import "./TreeMatchView.css";

const R = 22;
const X_GAP = 62;
const Y_GAP = 86;
const PAD = 40;

// Lay out the tree: leaves get consecutive x positions, parents sit above the middle of their children.
function layout(children, root) {
  const pos = {};
  let next = 0;
  const place = (v, depth) => {
    if (!children[v].length) {
      pos[v] = { x: next++, y: depth };
    } else {
      children[v].forEach(c => place(c, depth + 1));
      const xs = children[v].map(c => pos[c].x);
      pos[v] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth };
    }
  };
  place(root, 0);
  return pos;
}

export default function TreeMatchView({ run, step }) {
  if (!run || !step) {
    return <section className="tm-view" aria-label="Tree matching"><p className="tm-empty">Press Play to combine the tree from the leaves upward.</p></section>;
  }
  const { parents } = run.input;
  const n = parents.length;
  const children = Array.from({ length: n }, () => []);
  for (let v = 1; v < n; v++) children[parents[v]].push(v);
  const pos = layout(children, 0);
  const cols = Math.max(...Object.values(pos).map(p => p.x)) + 1;
  const rows = Math.max(...Object.values(pos).map(p => p.y)) + 1;
  const width = PAD * 2 + Math.max(1, cols - 1) * X_GAP;
  const height = PAD * 2 + (rows - 1) * Y_GAP;
  const X = v => PAD + pos[v].x * X_GAP;
  const Y = v => PAD + pos[v].y * Y_GAP;
  const fmt = v => (v === null || v === undefined ? "?" : v === -Infinity ? "-" : v);
  return (
    <section className="tm-view" aria-label="Tree matching">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tree with the current node and edge">
        {Array.from({ length: n - 1 }, (_, i) => i + 1).map(v => {
          const p = parents[v];
          const active = step.child === v;
          return (
            <g key={`e${v}`}>
              <line x1={X(p)} y1={Y(p)} x2={X(v)} y2={Y(v)} className={`tm-edge${active ? " tm-edge--active" : ""}`} />
              <text x={(X(p) + X(v)) / 2 + 6} y={(Y(p) + Y(v)) / 2} className="tm-weight">{run.input.weights[v]}</text>
            </g>
          );
        })}
        {Array.from({ length: n }, (_, v) => {
          const cls = step.node === v ? " tm-node--active" : step.free[v] !== null ? " tm-node--done" : "";
          return (
            <g key={`n${v}`} className={`tm-node${cls}`}>
              <circle cx={X(v)} cy={Y(v)} r={R} />
              <text x={X(v)} y={Y(v) + 4} className="tm-id">{v}</text>
              <text x={X(v)} y={Y(v) + R + 14} className="tm-values">free {fmt(step.free[v])} | match {fmt(step.matched[v])}</text>
            </g>
          );
        })}
      </svg>
      <p className="tm-legend">Edge labels are weights. Each node shows free (no child matched) and match (paired with one child). The amber edge is the one being tried.</p>
    </section>
  );
}
