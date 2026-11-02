import "./LcaTreeView.css";

const W = 520;
const TOP = 30;
const GAP = 70;
const R = 18;

function place(i) {
  const d = Math.floor(Math.log2(i + 1));
  const k = i + 1 - 2 ** d;
  return { x: ((k + 0.5) / 2 ** d) * W, y: TOP + d * GAP };
}

// Marked ancestors of p are green outlines; the climb from q is yellow; depth is printed under each node.
export default function Problem1740View({ run, step }) {
  const values = run.input.root;
  const { p, q } = run.input;
  const marked = new Set(step.marked);
  const depth = Math.floor(Math.log2(values.length));
  const height = TOP * 2 + depth * GAP;
  const edges = [];
  values.forEach((v, i) => {
    if (v === null || i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (values[parent] !== null) edges.push([parent, i]);
  });
  return (
    <section className="lca2-view" aria-label="Distance between two nodes in a binary tree">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree showing the path from p and q">
        {edges.map(([a, b]) => {
          const pa = place(a);
          const pb = place(b);
          return <line key={`${a}-${b}`} className="lca2-edge" x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
        })}
        {values.map((v, i) => {
          if (v === null) return null;
          const pt = place(i);
          const classes = ["lca2-node"];
          if (v === p || v === q) classes.push("lca2-node--target");
          if (v === step.current) classes.push("lca2-node--current");
          if (marked.has(v) && v !== step.current) classes.push("lca2-node--answer");
          const d = Math.floor(Math.log2(i + 1));
          return (
            <g key={i} className={classes.join(" ")}>
              <circle cx={pt.x} cy={pt.y} r={R} />
              <text x={pt.x} y={pt.y}>{v}</text>
              {step.depths[v] !== undefined && <text x={pt.x} y={pt.y + R + 10} style={{ fontSize: 10 }}>{`d=${step.depths[v] ?? d}`}</text>}
            </g>
          );
        })}
      </svg>
      <div className="lca2-legend">
        <span>Blue ring: p or q</span>
        <span>Green: ancestor of p (marked)</span>
        <span>Yellow: node being checked</span>
      </div>
      <p className="lca2-result">{step.phase === "answer" ? `Distance = ${run.result} edges (LCA ${run.lca})` : step.message}</p>
    </section>
  );
}
