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

// The defective pointer is a dashed red arc; the detached node and its subtree fade out once removed.
export default function Problem1660View({ run, step }) {
  const values = run.input.root;
  const [from, to] = run.input.bad;
  const seen = new Set(step.seen || []);
  const depth = Math.floor(Math.log2(values.length));
  const height = TOP * 2 + depth * GAP;
  const edges = [];
  values.forEach((v, i) => {
    if (v === null || i === 0) return;
    const parent = Math.floor((i - 1) / 2);
    if (values[parent] !== null) edges.push([parent, i]);
  });
  const removedIdx = new Set();
  if (step.removed !== null && step.removed !== undefined) {
    const mark = j => { if (j < values.length && values[j] !== null) { removedIdx.add(j); mark(2 * j + 1); mark(2 * j + 2) } };
    mark(step.removed);
  }
  const fromPt = place(values.indexOf(from));
  const toPt = place(values.indexOf(to));
  return (
    <section className="lca2-view" aria-label="Correct a binary tree">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Tree with a sideways pointer">
        {edges.map(([a, b]) => {
          const pa = place(a);
          const pb = place(b);
          const gone = removedIdx.has(b);
          return <line key={`${a}-${b}`} className="lca2-edge" style={gone ? { opacity: 0.2 } : undefined} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
        })}
        {step.defect !== null && step.defect !== undefined && (
          <line x1={fromPt.x + R} y1={fromPt.y} x2={toPt.x - R} y2={toPt.y} stroke="#dc2626" strokeWidth="2" strokeDasharray="6 4" />
        )}
        {values.map((v, i) => {
          if (v === null) return null;
          const pt = place(i);
          const classes = ["lca2-node"];
          if (i === step.current) classes.push("lca2-node--current");
          if (v === from) classes.push("lca2-node--target");
          if (v === to) classes.push("lca2-node--answer");
          const gone = removedIdx.has(i);
          return (
            <g key={i} className={classes.join(" ")} opacity={gone ? 0.2 : seen.has(i) || seen.size === 0 ? 1 : 0.5}>
              <circle cx={pt.x} cy={pt.y} r={R} />
              <text x={pt.x} y={pt.y}>{v}</text>
            </g>
          );
        })}
      </svg>
      <div className="lca2-legend">
        <span>Blue ring: defective node</span>
        <span>Green: target of the sideways pointer</span>
        <span>Dashed red: the wrong right pointer</span>
        <span>Faded: removed</span>
      </div>
      <p className="lca2-result">{step.phase === "done" ? `Corrected: [${run.result.map(v => (v === null ? "null" : v)).join(", ")}]` : step.message}</p>
    </section>
  );
}
