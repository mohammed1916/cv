import SvgViewport from '../../components/shared/SvgViewport';
import StoryPanel from '../../components/shared/StoryPanel';

export default function MirrorTreeStory({ positions, edges, nodes, activeLeftId, activeRightId, nodeStates }) {
  const width = Math.max(320, ...[...positions.values()].map(p => p.x + 48));
  const height = Math.max(240, ...[...positions.values()].map(p => p.y + 48));
  const left = positions.get(activeLeftId), right = positions.get(activeRightId);
  const root = nodes.find(n => n.id === 'n-0');
  const axis = positions.get(root?.id)?.x ?? width / 2;
  return <StoryPanel className="mirror-story" title="Compare across the mirror" description="Outer children pair together; inner children pair together. Matching values alone do not prove symmetry.">
    <p>Left partner: {nodes.find(n=>n.id===activeLeftId)?.val ?? 'missing'} · Right partner: {nodes.find(n=>n.id===activeRightId)?.val ?? 'missing'}</p>
    <SvgViewport width={width} height={height}>
      <title>Mirror pairs in the binary tree</title>
      <line x1={axis} x2={axis} y1="12" y2={height-12} stroke="var(--primary)" strokeDasharray="4 6" opacity="0.5" />
      {edges.map(e=>{const a=positions.get(e.fromId),b=positions.get(e.toId);return <line key={e.toId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" />;})}
      {left && right && <path d={`M ${left.x} ${left.y} Q ${(left.x+right.x)/2} ${left.y-65} ${right.x} ${right.y}`} stroke="var(--primary)" fill="none" strokeWidth="3" strokeDasharray="5 3" />}
      {nodes.map(node=>{const p=positions.get(node.id),active=node.id===activeLeftId||node.id===activeRightId,state=nodeStates?.[node.id];return <g key={node.id} transform={`translate(${p.x},${p.y})`}>
        <circle r="22" fill="var(--surface2)" stroke={active?'var(--primary)':'var(--text-muted)'} strokeWidth={active?3:1}/>
        <text textAnchor="middle" y="5" fill="var(--text)">{node.val}</text>
        <text textAnchor="middle" y="37" fontSize="10" fill="var(--text-muted)">{state==='mirror-fail'?'Mismatch':state==='mirror-ok'?'Values match':active?'Compare':''}</text>
      </g>;})}
      {!nodes.length && <text x="24" y="48" fill="var(--text-muted)">Empty tree: symmetric</text>}
    </SvgViewport>
  </StoryPanel>;
}
