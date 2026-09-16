import SvgViewport from './SvgViewport';

export default function TreeDiagram({ positions, edges, nodes, activeIds = new Set(), visitedIds = new Set(), queueIds = new Set(), labelForNode, onNodeSelect }) {
  const width=Math.max(320,...[...positions.values()].map(p=>p.x+48));
  const height=Math.max(240,...[...positions.values()].map(p=>p.y+48));
  return <SvgViewport width={width} height={height}>
    <title>Tree traversal state</title>
    {edges.map(e=>{const a=positions.get(e.fromId),b=positions.get(e.toId);return <line key={e.toId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)"/>;})}
    {nodes.map(n=>{const p=positions.get(n.id),active=activeIds.has(n.id);return <g key={n.id} transform={`translate(${p.x},${p.y})`} role={onNodeSelect?'button':undefined} tabIndex={onNodeSelect?0:undefined} aria-label={onNodeSelect?`Select node ${n.val}, id ${n.id}`:undefined} onClick={onNodeSelect?()=>onNodeSelect(n):undefined} onKeyDown={onNodeSelect?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onNodeSelect(n);}}:undefined}>
      <circle r="22" fill="var(--surface2)" stroke={active?'var(--primary)':'var(--text-muted)'} strokeWidth={active?4:1}/>
      <text textAnchor="middle" y="5" fill="var(--text)">{n.val}</text>
      <text textAnchor="middle" y="38" fontSize="10" fill="var(--text-muted)">{labelForNode?labelForNode(n):active?'Current':visitedIds.has(n.id)?'Visited':queueIds.has(n.id)?'Queued':''}</text>
    </g>;})}
    {!nodes.length&&<text x="24" y="40" fill="var(--text-muted)">Empty tree</text>}
  </SvgViewport>;
}
