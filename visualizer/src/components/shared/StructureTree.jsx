import SvgViewport from './SvgViewport';

// Stable IDs and parent links let both heaps and interval trees use this view.
export default function StructureTree({ nodes, activeIds = [], title = 'Tree state' }) {
  const children = new Map(nodes.map(node => [node.id, []]));
  for (const node of nodes) if (node.parent !== null) children.get(node.parent)?.push(node.id);
  const positions = new Map();
  let leaves = 0, depth = 0;
  function place(id, level) {
    depth = Math.max(depth, level);
    const xs = children.get(id).map(child => place(child, level + 1));
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : 60 + 110 * leaves++;
    positions.set(id, { x, y: 50 + level * 90 });
    return x;
  }
  if (nodes.length) place(nodes[0].id, 0);
  return <SvgViewport width={Math.max(320, leaves * 110 + 20)} height={Math.max(220, depth * 90 + 110)}>
    <title>{title}</title>
    {nodes.filter(node => node.parent !== null).map(node => {
      const a = positions.get(node.parent), b = positions.get(node.id);
      return <line key={node.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" />;
    })}
    {nodes.map(node => {
      const p = positions.get(node.id);
      return <g key={node.id} transform={`translate(${p.x},${p.y})`}>
        <title>{`${node.detail}: ${node.label}`}</title>
        <rect x={-43} y={-22} width={86} height={44} rx={10} fill="var(--surface2)" stroke={activeIds.includes(node.id) ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={activeIds.includes(node.id) ? 3 : 1} />
        <text textAnchor="middle" y={5} fill="var(--text)">{node.label}</text>
        <text textAnchor="middle" y={39} fill="var(--text-muted)" fontSize={11}>{node.detail}</text>
      </g>;
    })}
    {!nodes.length && <text x={24} y={50} fill="var(--text-muted)">Empty tree</text>}
  </SvgViewport>;
}
