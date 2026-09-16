import { useId } from 'react';
import StoryPanel from './StoryPanel';
import SvgViewport from './SvgViewport';

export default function NextPointersStory({ story, step }) {
  const marker = useId().replace(/:/g,'');
  return <StoryPanel title={story.mode === 'perfect' ? 'Siblings first. Then bridge their parents.' : 'Build the next row across the gaps.'} description={step.message}>
    <p>{story.mode === 'perfect' ? 'A perfect tree guarantees both children. Existing parent links reveal the next parent’s left child.' : 'A dummy head remembers the next row’s first real child. Tail grows that row without a queue.'}</p>
    <p>Parent depth: {step.level}. Current: {step.currentId === null ? 'none' : `#${step.currentId}`}. {story.mode === 'sparse' && `Dummy.next: ${step.headId === null ? 'null' : `#${step.headId}`}; tail: ${step.tailId === null ? 'dummy' : `#${step.tailId}`}.`}</p>
    <SvgViewport width={story.width+40} height={story.height}>
      <title>Tree child edges and directed next pointers</title>
      <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--primary)"/></marker></defs>
      {story.edges.map(e=>{const a=story.positions.get(e.fromId),b=story.positions.get(e.toId);return <line key={e.toId} x1={a.x} y1={a.y+22} x2={b.x} y2={b.y-22} stroke="var(--border)"/>;})}
      {story.nodes.map(n=>{const a=story.positions.get(n.id),to=step.next[n.id],b=story.positions.get(to),changed=step.changed?.from===n.id;return <g key={`next-${n.id}`}>
        {b ? <path d={`M${a.x+20},${a.y-12} Q${(a.x+b.x)/2},${a.y-43} ${b.x-22},${b.y-12}`} fill="none" stroke="var(--primary)" strokeWidth={changed?4:2} markerEnd={`url(#${marker})`}/> : <text x={a.x+25} y={a.y-14} fill="var(--text-muted)" fontSize="10">null</text>}
      </g>;})}
      {story.nodes.map(n=>{const p=story.positions.get(n.id),active=n.id===step.currentId;return <g key={n.id} transform={`translate(${p.x},${p.y})`}>
        <circle r="22" fill="var(--surface2)" stroke={active?'var(--primary)':'var(--text-muted)'} strokeWidth={active?4:1}/><text textAnchor="middle" y="5" fill="var(--text)">{n.val}</text>
        <text textAnchor="middle" y="38" fontSize="10" fill="var(--text-muted)">#{n.id} {active?'current':n.id===step.tailId?'tail':''}</text>
      </g>;})}
      {!story.nodes.length && <text x="24" y="40" fill="var(--text-muted)">Empty tree</text>}
    </SvgViewport>
    {step.changed && <p>Write: {step.changed.from === null ? 'dummy' : `#${step.changed.from}`}.next = #{step.changed.to}</p>}
    <p>Thin straight lines are child links. Curved arrows are next links. Labels retain node identity when values repeat.</p>
  </StoryPanel>;
}
