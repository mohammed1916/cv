import StoryPanel from '../../components/shared/StoryPanel';
import RecurrenceGrid from '../../components/shared/RecurrenceGrid';
import { subsequenceCellAt } from './algorithm';

export default function SubsequenceStory({ story, stepIndex }) {
  const step = story.frames[Math.max(0, stepIndex)], {i,j} = step;
  return <StoryPanel title="Skip it, or use it to finish the prefix" description={step.message}>
    <p>Source: “{story.s.join('') || 'empty'}” → target: “{story.t.join('') || 'empty'}”. Count choices of positions, even when letters repeat.</p>
    {i>0 && j>0 && step.phase !== 'done' && <>
      <p>Build target prefix “{story.t.slice(0,j).join('')}” from source prefix “{story.s.slice(0,i).join('')}”. Compare source #{i-1} “{story.s[i-1]}” with target #{j-1} “{story.t[j-1]}”.</p>
      <p><strong>Skip:</strong> {step.skip} ways without source #{i-1}. <strong>Use:</strong> {step.phase === 'skip' ? 'compare the letters next' : step.matched ? `${step.use} ways from the diagonal, extended by this matching letter` : '0 ways because the letters differ'}.</p>
      {step.phase==='match' && <p>{step.skip} + {step.use} = <strong>{step.value}</strong>. These choices cannot overlap: one excludes this source position and the other includes it.</p>}
    </>}
    {step.phase==='done' && <p>Answer: <strong>{step.value}</strong></p>}
    <RecurrenceGrid label="Ways to form each target prefix" rowLabels={['empty',...story.s.map((ch,k)=>`${k+1}: ${ch}`)]} columnLabels={['empty',...story.t.map((ch,k)=>`${k+1}: ${ch}`)]}
      row={i} column={j} valueAt={(r,c)=>subsequenceCellAt(story,stepIndex,r,c)}
      roleAt={(r,c)=>r===i&&c===j?'current':i>0&&j>0&&r===i-1&&c===j?'skip':i>0&&j>0&&r===i-1&&c===j-1?'use':''}/>
  </StoryPanel>;
}
