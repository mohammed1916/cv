import "./LcaTreeView.css";

const W = 520;
const TOP = 30;
const GAP = 70;
const R = 18;

// Heap-style index to position: level d holds 2^d slots spread across the width.
function place(i) {
  const d = Math.floor(Math.log2(i + 1));
  const k = i + 1 - 2 ** d;
  return { x: ((k + 0.5) / 2 ** d) * W, y: TOP + d * GAP };
}

export default function Problem1644View({ run, step }) {
  const values = run.input.root;
  const { p, q } = run.input;
  const cur = step.current;
  const ans = step.returned;
  const depth = Math.floor(Math.log2(values.length));
  const height = TOP * 2 + depth * GAP;
  const edges = [];
  values.forEach((v, i) => {
    if (v === null || i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (values[parent] === null) return;
    edges.push([parent, i]);
  });
  return (
    <section className="lca2-view" aria-label="Lowest common ancestor tree, version two">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Binary tree with the current node highlighted">
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
          if (i === cur) classes.push("lca2-node--current");
          if (i === ans) classes.push("lca2-node--answer");
          return (
            <g key={i} className={classes.join(" ")}>
              <circle cx={pt.x} cy={pt.y} r={R} />
              <text x={pt.x} y={pt.y}>{v}</text>
              {(v === p || v === q) && <text x={pt.x} y={pt.y + R + 12} style={{ fontSize: 11 }}>{v === p ? "p" : "q"}</text>}
            </g>
          );
        })}
      </svg>
      <div className="lca2-legend">
        <span>Blue ring: p or q</span>
        <span>Yellow: node being checked</span>
        <span>Green: answer</span>
        <span>{`foundP ${step.foundP ? "yes" : "no"} · foundQ ${step.foundQ ? "yes" : "no"}`}</span>
      </div>
      <p className="lca2-result">{run.result === null ? "Answer: null" : `Answer: ${run.result}`}</p>
    </section>
  );
}
