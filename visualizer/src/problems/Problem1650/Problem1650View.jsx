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

// Two walkers climb parent pointers; the view marks where each stands and whether it just jumped.
export default function Problem1650View({ run, step }) {
  const values = run.input.root;
  const depth = Math.floor(Math.log2(values.length));
  const height = TOP * 2 + depth * GAP;
  const edges = [];
  values.forEach((v, i) => {
    if (v === null || i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (values[parent] !== null) edges.push([parent, i]);
  });
  const meet = step.a === step.b;
  return (
    <section className="lca2-view" aria-label="Lowest common ancestor with parent pointers">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree with two walkers">
        {edges.map(([a, b]) => {
          const pa = place(a);
          const pb = place(b);
          return <line key={`${a}-${b}`} className="lca2-edge" x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
        })}
        {values.map((v, i) => {
          if (v === null) return null;
          const pt = place(i);
          const classes = ["lca2-node"];
          if (i === step.a && i === step.b) classes.push("lca2-node--answer");
          else if (i === step.a || i === step.b) classes.push("lca2-node--current");
          return (
            <g key={i} className={classes.join(" ")}>
              <circle cx={pt.x} cy={pt.y} r={R} />
              <text x={pt.x} y={pt.y}>{v}</text>
              {i === step.a && <text x={pt.x - R - 10} y={pt.y - 12} style={{ fontSize: 11 }}>A</text>}
              {i === step.b && <text x={pt.x + R + 10} y={pt.y - 12} style={{ fontSize: 11 }}>B</text>}
            </g>
          );
        })}
      </svg>
      <div className="lca2-legend">
        <span>A and B: the two walkers</span>
        <span>Yellow: a walker stands here</span>
        <span>{step.switched ? "A walker jumped to the other start" : "Both climbing by parent pointers"}</span>
      </div>
      <p className="lca2-result">{meet ? `Walkers meet at ${run.result}` : `A at ${run.input.root[step.a]}, B at ${run.input.root[step.b]}`}</p>
    </section>
  );
}
