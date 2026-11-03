import "./TreeGroupsView.css";

const PALETTE = ["#0f766e", "#b45309", "#6d28d9", "#be123c", "#1d4ed8", "#4d7c0f", "#a16207", "#0e7490", "#9333ea"];
const GAP = 64;
const TOP = 48;

// Lay the tree out with leaves in visit order and parents centred above their children.
function layout(parent, n) {
  const kids = Array.from({ length: n }, () => []);
  parent.forEach((p, v) => { if (p >= 0) kids[p].push(v); });
  const x = Array(n).fill(0);
  const depth = Array(n).fill(0);
  let leaf = 0;
  const walk = (v, d) => {
    depth[v] = d;
    if (!kids[v].length) { x[v] = leaf++; return; }
    kids[v].forEach(c => walk(c, d + 1));
    x[v] = kids[v].reduce((sum, c) => sum + x[c], 0) / kids[v].length;
  };
  walk(0, 0);
  return { x, depth };
}

export default function TreeGroupsView({ run, step }) {
  if (!run || !step) return <p className="tg-empty">Press Play to walk the tree from the leaves up.</p>;
  const { groups, edges } = run.input;
  const n = groups.length;
  const par = parentFromFrames(run, n);
  const { x, depth } = layout(par, n);
  const width = Math.max(260, (Math.max(...x) + 1) * GAP + 40);
  const height = (Math.max(...depth) + 1) * GAP + TOP + 30;
  const px = v => 28 + x[v] * GAP;
  const py = v => TOP + depth[v] * GAP;
  const total = groups.reduce((m, g) => ({ ...m, [g]: (m[g] || 0) + 1 }), {});
  return (
    <section className="tg-view" aria-label="Tree groups interaction cost">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tree of ${n} nodes, current node ${step.node}`}>
        {edges.map(([u, v]) => {
          const child = par[u] === v ? u : v;
          const active = child === step.node && step.parent >= 0;
          return <line key={`${u}-${v}`} x1={px(u)} y1={py(u)} x2={px(v)} y2={py(v)} className={active ? "tg-edge tg-edge--active" : "tg-edge"} />;
        })}
        {groups.map((g, v) => {
          const done = step.finished?.includes(v);
          const current = v === step.node;
          return (
            <g key={v} transform={`translate(${px(v)} ${py(v)})`}>
              <circle r="18" fill={PALETTE[(g - 1) % PALETTE.length]} className={current ? "tg-node tg-node--current" : done ? "tg-node tg-node--done" : "tg-node"} />
              <text y="5" textAnchor="middle" className="tg-label">{`${v}:${g}`}</text>
              <text y="34" textAnchor="middle" className="tg-sub">{step.subtree ? subtreeText(step.subtree[v], total) : ""}</text>
            </g>
          );
        })}
      </svg>
      <dl className="tg-readout">
        <div><dt>Node</dt><dd>{step.node >= 0 ? `${step.node} (group ${groups[step.node]})` : "none"}</dd></div>
        <div><dt>Edge gain</dt><dd>{step.contribution}</dd></div>
        <div><dt>Answer so far</dt><dd>{step.answer}</dd></div>
      </dl>
      <p className="tg-legend">Labels read node:group. Under each node, its subtree counts as group:count against the whole-tree total.</p>
    </section>
  );
}

function subtreeText(counts, total) {
  if (!counts) return "";
  return Object.entries(counts).map(([g, a]) => `${g}:${a}/${total[g]}`).join(" ");
}

// The parent array is not stored in frames, so rebuild it from the recorded order and the edges.
function parentFromFrames(run, n) {
  const { edges } = run.input;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
  const par = Array(n).fill(-1);
  const seen = Array(n).fill(false);
  seen[0] = true;
  const queue = [0];
  for (let i = 0; i < queue.length; i += 1) {
    const v = queue[i];
    for (const w of adj[v]) if (!seen[w]) { seen[w] = true; par[w] = v; queue.push(w); }
  }
  return par;
}
