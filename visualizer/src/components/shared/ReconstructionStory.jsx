import { useMemo } from 'react';
import StoryPanel from './StoryPanel';
import TreeDiagram from './TreeDiagram';
import { binaryTreeLayout } from './binaryTreeLayout';
import './SortedTreeStory.css';

export default function ReconstructionStory({ story, stepIndex }) {
  const layout=useMemo(()=>binaryTreeLayout(story.root),[story]);
  const step=story.frames[Math.max(0,stepIndex)],visible=story.nodes.filter(n=>n.createdAt<=stepIndex),ids=new Set(visible.map(n=>n.id));
  return <StoryPanel className="reconstruction-story" title={story.order==='preorder'?'Root first. Split by inorder.':'Root last. Split by inorder.'} description={step.message}>
    {[['inorder',story.inorder,step.lo,step.hi,step.mid],[story.order,story.traversal,step.start,step.end,step.cursor]].map(([name,values,lo,hi,selected])=><div key={name}>
      <strong>{name} interval [{lo}, {hi})</strong>
      <div className="list-tree-story__list" tabIndex={0} aria-label={name}>{values.map((v,i)=><div key={i} className={`list-tree-story__cell ${i>=lo&&i<hi?'in-range':''} ${i===selected?'selected':''}`}><small>#{i}</small><strong>{v}</strong><small>{i===selected?'root':i>=lo&&i<hi?'in interval':'outside'}</small></div>)}</div>
    </div>)}
    <TreeDiagram positions={layout.positions} edges={layout.edges.filter(e=>ids.has(e.fromId)&&ids.has(e.toId))} nodes={visible} activeIds={new Set(step.mid===undefined?[]:[step.mid])} labelForNode={n=>n.returnedAt<=stepIndex?'Complete':'Building'}/>
    <p>{visible.length}/{story.nodes.length} nodes created. The traversal chooses the root; inorder determines subtree membership.</p>
  </StoryPanel>;
}
