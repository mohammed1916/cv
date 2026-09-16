import './SortedTreeStory.css';
import { useMemo } from 'react';
import SvgViewport from './SvgViewport';
import StoryPanel from './StoryPanel';
import { binaryTreeLayout } from './binaryTreeLayout';

export default function SortedTreeStory({ story, values, stepIndex, sourceKind = 'list' }) {
  const layout = useMemo(() => binaryTreeLayout(story.root), [story]);
  const step = story.frames[Math.max(0, stepIndex)];
  const visible = new Set(story.nodes.filter(n => n.createdAt <= stepIndex).map(n => n.id));
  return <StoryPanel className="list-tree-story" label={`Sorted ${sourceKind} becomes a balanced tree`} title="Split the order. Grow the tree." description={step.message}>
    <div className="list-tree-story__list" tabIndex={0} aria-label={`Original ${sourceKind} with stable indices`}>
      {values.map((value, i) => <div key={i} className={`list-tree-story__cell ${i >= step.lo && i < step.hi ? 'in-range' : ''} ${i === step.mid ? 'selected' : ''}`}>
        <small>#{i}</small><strong>{value}</strong><small>{i === step.mid ? 'root' : i < step.copied ? (sourceKind === 'list' ? 'copied' : 'available') : 'waiting'}</small>
      </div>)}
      {!values.length && <span>Empty {sourceKind}</span>}
    </div>
    <p>Active interval [{step.lo}, {step.hi}) · {visible.size}/{values.length} tree nodes created. Indices distinguish equal values.</p>
    <SvgViewport width={layout.width} height={layout.height}>
      <title>Tree construction from the sorted list</title>
      {layout.edges.filter(e => visible.has(e.fromId) && visible.has(e.toId)).map(e => {
        const a = layout.positions.get(e.fromId), b = layout.positions.get(e.toId);
        return <line key={e.toId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" strokeWidth="2" />;
      })}
      {story.nodes.filter(n => visible.has(n.id)).map(node => {
        const pos = layout.positions.get(node.id), complete = node.returnedAt <= stepIndex;
        return <g key={node.id} transform={`translate(${pos.x},${pos.y})`} className={node.id === step.mid ? 'selected' : ''}>
          <circle r="23" fill="var(--surface2)" stroke={complete ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={complete ? 3 : 1} />
          <text textAnchor="middle" dy="5" fill="var(--text)">{node.val}</text>
          <text textAnchor="middle" y="39" fill="var(--text-muted)" fontSize="11">#{node.id} · {complete ? `height ${node.height}` : 'building'}</text>
        </g>;
      })}
      {!visible.size && <text x="24" y="40" fill="var(--text-muted)">The first midpoint becomes the root.</text>}
    </SvgViewport>
  </StoryPanel>;
}
