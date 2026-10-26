import StoryPanel from '../../components/shared/StoryPanel';
import SvgViewport from '../../components/shared/SvgViewport';

export default function FlattenStory({ story, stepIndex }) {
  const step = story.frames[Math.max(0, stepIndex)];
  const chain = [], seen = new Set();
  for (let id = story.rootId; id !== null && !seen.has(id); id = step.links[id].right) { seen.add(id); chain.push(id); }
  const values = new Map(story.nodes.map(n => [n.id, n.val]));
  return <StoryPanel title="Splice the left branch into the right chain" description={step.message}>
    <p>Dashed L = left pointer; solid R = right pointer. Node positions stay fixed so each changed connection is visible.</p>
    <SvgViewport width={story.width} height={story.height}>
      <title>Pointer rewiring at original tree positions</title>
      {story.nodes.flatMap(n => ['left', 'right'].map(side => {
        const to = step.links[n.id][side];
        if (to === null) return null;
        const a = story.positions.get(n.id), b = story.positions.get(to);
        const changed = step.changed?.from === n.id && step.changed.side === side;
        const offset = side === 'left' ? -5 : 5;
        return <g key={`${n.id}-${side}`}>
          <line x1={a.x + offset} y1={a.y + 22} x2={b.x + offset} y2={b.y - 22} stroke={changed ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={changed ? 4 : 1.5} strokeDasharray={side === 'left' ? '5 4' : undefined} />
          <text x={(a.x+b.x)/2 + offset * 2} y={(a.y+b.y)/2} fill="var(--text)" fontSize="11">{side === 'left' ? 'L' : 'R'}</text>
        </g>;
      }))}
      {story.nodes.map(n => { const p = story.positions.get(n.id); return <g key={n.id} transform={`translate(${p.x},${p.y})`}>
        <circle r="22" fill="var(--surface2)" stroke={n.id === step.cur || n.id === step.pre ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={n.id === step.cur ? 4 : 2}/>
        <text textAnchor="middle" y="5" fill="var(--text)">{n.val}</text>
        <text textAnchor="middle" y="39" fill="var(--text-muted)" fontSize="11">#{n.id} {n.id === step.cur ? 'current' : n.id === step.pre ? 'predecessor' : step.settled.includes(n.id) ? 'settled' : ''}</text>
      </g>; })}
      {!story.nodes.length && <text x="24" y="40" fill="var(--text-muted)">Empty tree</text>}
    </SvgViewport>
    {step.changed && <p>Changed: #{step.changed.from}.{step.changed.side} = {step.changed.to === null ? 'null' : `#${step.changed.to}`}</p>}
    <h4>Current right chain</h4>
    <p>{chain.map(id => `${values.get(id)} (#${id})`).join(' → ') || 'Empty'} → null</p>
    <p>{step.settled.length}/{story.nodes.length} nodes settled. Before completion, this chain may still have left branches.</p>
  </StoryPanel>;
}
