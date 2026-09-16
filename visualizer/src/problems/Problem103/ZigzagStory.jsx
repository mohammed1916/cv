import StoryPanel from '../../components/shared/StoryPanel';
import TreeDiagram from '../../components/shared/TreeDiagram';

export default function ZigzagStory({ step }) {
  if(!step)return null;
  return <StoryPanel className="zigzag-story" title="One queue. Alternating output rows." description={step.message}>
    <p>Output direction: {step.leftToRight?'left to right →':'← right to left'}. Queue visitation always stays FIFO.</p>
    <p>Queue front → back: {step.queue.map(n=>`${n.val} (#${n.id})`).join(' → ')||'empty'}</p>
    <p>Working row: [{step.level.join(', ')}]</p>
    <TreeDiagram positions={step.positions} edges={step.edges} nodes={step.allNodes} activeIds={step.activeIds} visitedIds={step.visitedIds} queueIds={step.queueIds}/>
    <ol aria-label="Zigzag output rows">{step.result.map((row,i)=><li key={i}>{i%2?'←':'→'} [{row.join(', ')}]</li>)}</ol>
  </StoryPanel>;
}
