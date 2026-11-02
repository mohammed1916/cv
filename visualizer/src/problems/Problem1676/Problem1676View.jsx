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

// Targets are blue rings; visited nodes are dimmed outlines; the returned node is green.
export default function Problem1676View({ run, step }) {
  const values = run.input.root;
  const targets = new Set(run.input.nodes);
  const visited = new Set(step.visited.map(i => i));
  const depth = Math.floor(Math.log2(values.length));
  const height = TOP * 2 + depth * GAP;
  const edges = [];
  values.forEach((v, i) => {
    if (v === null || i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (values[parent] !== null) edges.push([parent, i]);
  });
  return (
    <section className="lca2-view" aria-label="Lowest common ancestor of several nodes">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree with target nodes">
        {edges.map(([a, b]) => {
          const pa = place(a);
          const pb = place(b);
          return <line key={`${a}-${b}`} className="lca2-edge" x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
        })}
        {values.map((v, i) => {
          if (v === null) return null;
          const pt = place(i);
          const classes = ["lca2-node"];
          if (targets.has(v)) classes.push("lca2-node--target");
          if (i === step.current) classes.push("lca2-node--current");
          if (i === step.returned) classes.push("lca2-node--answer");
          return (
            <g key={i} className={classes.join(" ")} opacity={visited.has(i) || step.visited.length === 0 ? 1 : 0.55}>
              <circle cx={pt.x} cy={pt.y} r={R} />
              <text x={pt.x} y={pt.y}>{v}</text>
            </g>
          );
        })}
      </svg>
      <div className="lca2-legend">
        <span>Blue ring: a supplied node</span>
        <span>Yellow: being checked</span>
        <span>Green: returned</span>
        <span>{`Visited ${step.visited.length} node${step.visited.length === 1 ? "" : "s"}`}</span>
      </div>
      <p className="lca2-result">{run.result === null ? "Answer: pending" : `Answer: ${run.result}`}</p>
    </section>
  );
}
