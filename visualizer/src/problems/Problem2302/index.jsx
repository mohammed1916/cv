import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2302',
  phases: [
    { id: 'grow', label: 'Grow', description: 'Move r right and add its value to the window.' },
    { id: 'shrink', label: 'Shrink', description: 'Move l right while the window score is not below k.' },
    { id: 'count', label: 'Count', description: 'Every window ending at r with l as its start scores below k.' },
    { id: 'done', label: 'Result', description: 'Return the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 2, 3], "k": 6}',
  url: 'https://leetcode.com/problems/count-subarrays-with-score-less-than-k/',
  complexity: 'O(n) time and O(1) extra space. Each pointer moves right at most n times, since all values are positive.',
  examples: [
    { label: 'Example', input: '{"nums":[1,2,3],"k":6}' },
    { label: 'Wider', input: '{"nums":[4,2,1,6],"k":13}' },
  ],
}

export default function LowScoreSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    const inWindow = i => step.l >= 0 && i >= step.l && i <= step.r
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.r}
        roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : inWindow(i) ? 'window' : '')} />
      <output aria-label="Window score">{step.l >= 0 && step.r >= 0 ? `window sum ${step.total}, length ${step.r - step.l + 1}, score ${step.total * (step.r - step.l + 1)} (limit below ${run.input.k})` : `count ${step.count}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>The score grows with each element, so for every right end r the windows that score below k form a block that starts at some l and ends at r.</p>
    <p>Move l right while the window is too big. Since values are positive, l never moves back, and each window ending at r adds r - l + 1 to the answer.</p>
  </>} />
}
