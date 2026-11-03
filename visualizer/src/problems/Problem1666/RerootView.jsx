import "./RerootView.css";

const GAP_X = 52;
const GAP_Y = 64;
const PAD = 34;

export default function RerootView({ run, step }) {
  const { layout } = run;
  const vals = Object.keys(layout).map(Number);
  const cols = Math.max(...vals.map(v => layout[v].x)) + 1;
  const rows = Math.max(...vals.map(v => layout[v].y)) + 1;
  const width = cols * GAP_X + PAD * 2;
  const height = rows * GAP_Y + PAD * 2;
  const at = val => ({ x: PAD + layout[val].x * GAP_X, y: PAD + layout[val].y * GAP_Y });
  const linkOf = val => step.links.find(n => n.val === val);
  const role = val => {
    if (val === step.cur) return "is-cur";
    if (val === step.prev) return "is-prev";
    if (val === step.parent) return "is-parent";
    if (val === step.other) return "is-other";
    if (val === run.input.leaf && step.phase === "done") return "is-root";
    return "";
  };
  const edges = [];
  for (const node of step.links) {
    if (node.left !== null) edges.push({ from: node.val, to: node.left, side: "left" });
    if (node.right !== null) edges.push({ from: node.val, to: node.right, side: "right" });
  }
  const label = step.phase === "done" ? "new root" : step.phase === "start" ? "leaf" : "";

  return (
    <div className="reroot-view">
      <svg className="reroot-tree" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tree with pointers as they stand in this step">
        {edges.map(e => {
          const a = at(e.from);
          const b = at(e.to);
          return (
            <line key={`${e.from}-${e.side}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              className={`reroot-edge ${e.side}`} />
          );
        })}
        {vals.map(val => {
          const p = at(val);
          const link = linkOf(val);
          const cls = ["reroot-node", role(val), link && link.left === null && link.right === null ? "is-leaf" : ""].join(" ");
          return (
            <g key={val} className={cls} transform={`translate(${p.x} ${p.y})`}>
              <circle r="17" />
              <text textAnchor="middle" dominantBaseline="central">{val}</text>
            </g>
          );
        })}
      </svg>

      <dl className="reroot-state" aria-label="Pointers of the current node">
        <div><dt>cur</dt><dd>{step.cur ?? "none"}</dd></div>
        <div><dt>prev</dt><dd>{step.prev ?? "none"}</dd></div>
        <div><dt>parent</dt><dd>{step.parent ?? "none"}</dd></div>
        <div><dt>off-path child</dt><dd>{step.other ?? "none"}</dd></div>
      </dl>
      {label && <p className="reroot-label">{label}: {run.input.leaf}</p>}
    </div>
  );
}
