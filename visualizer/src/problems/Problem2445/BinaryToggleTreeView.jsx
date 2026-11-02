import "./BinaryToggleTreeView.css";

const R = 18;
const GAP_Y = 70;
const PAD = 30;

// Position of node i in a complete binary tree: row = floor(log2 i), spread evenly across its row.
function position(i, width, levels) {
  const row = Math.floor(Math.log2(i));
  const slots = 2 ** row;
  const index = i - slots;
  const x = PAD + ((index + 0.5) / slots) * (width - PAD * 2);
  const y = PAD + row * GAP_Y;
  return { x, y, row, levels };
}

export default function BinaryToggleTreeView({ run, step }) {
  if (!run || !step) {
    return <section className="toggle-view" aria-label="Binary tree toggles"><p className="toggle-empty">Press Play to mark the queries and walk the tree.</p></section>;
  }
  const { n, queries } = run.input;
  const levels = Math.floor(Math.log2(n)) + 1;
  const width = 560;
  const height = PAD * 2 + (levels - 1) * GAP_Y;
  const pos = i => position(i, width, levels);
  return (
    <section className="toggle-view" aria-label="Binary tree toggles">
      <p className="toggle-queries">Queries: {queries.length ? queries.join(", ") : "none"}</p>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Complete binary tree with values">
        {Array.from({ length: n }, (_, k) => k + 1).filter(i => i > 1).map(i => {
          const a = pos(Math.floor(i / 2)), b = pos(i);
          return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="toggle-edge" />;
        })}
        {Array.from({ length: n }, (_, k) => k + 1).map(i => {
          const p = pos(i);
          const value = step.parity ? step.parity[i - 1] : null;
          const shown = step.parity && step.parity[i - 1] !== null && step.parity[i - 1] !== undefined;
          const marked = step.mark[i] === 1;
          const cls = ["toggle-node", step.node === i ? "toggle-node--active" : "", shown && value === 1 ? "toggle-node--one" : "", shown && value === 0 ? "toggle-node--zero" : ""].join(" ");
          return (
            <g key={i} className={cls}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text x={p.x} y={p.y - 2} className="toggle-id">{i}</text>
              <text x={p.x} y={p.y + 10} className="toggle-value">{shown ? value : "?"}</text>
              {marked && <text x={p.x + R - 2} y={p.y - R + 2} className="toggle-mark">{"⚑"}</text>}
            </g>
          );
        })}
      </svg>
      <dl className="toggle-state">
        <div><dt>Node</dt><dd>{step.node ?? "-"}</dd></div>
        <div><dt>Ones so far</dt><dd>{step.parity ? step.parity.slice(0, step.shownUpTo).filter(v => v === 1).length : 0}</dd></div>
      </dl>
      <p className="toggle-note">Flag marks the queried nodes. Value 1 nodes are filled amber; 0 nodes are pale.</p>
    </section>
  );
}
