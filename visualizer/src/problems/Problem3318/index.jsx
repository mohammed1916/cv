import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how many times each value occurs in the window.' },
    { id: 'rank', label: 'Rank', description: 'Order the values by frequency, then by larger value.' },
    { id: 'sum', label: 'Sum', description: 'Add value times count for the top x values.' },
    { id: 'done', label: 'Complete', description: 'Report the x-sum of every window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 40 values from 1 to 50), k and x, for example {"nums":[1,1,2,2,3,4,2,3],"k":6,"x":2}',
  url: 'https://leetcode.com/problems/find-x-sum-of-all-k-long-subarrays-i/',
  complexity: 'O((n - k + 1) * k log k) time for the sorting per window. The visualization caps nums at 40 values.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[2,2,3,3,4,5,3,4],"k":7,"x":3}' },
    { label: 'Own case 2', input: '{"nums":[4,9,8,9,8,6],"k":3,"x":3}' },
    { label: 'Single entry', input: '{"nums":[5],"k":1,"x":1}' },
    { label: 'Equal values', input: '{"nums":[7,7,7,7],"k":4,"x":2}' },
    { label: 'Largest allowed size, equal values', input: '{"nums":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"k":40,"x":40}' },
    { label: 'Long run: 40 entries', input: '{"nums":[34,9,50,5,40,33,10,46,10,4,43,39,26,44,9,22,45,50,44,19,1,9,5,35,3,27,41,17,2,4,20,27,38,31,34,1,23,28,27,15],"k":20,"x":5}' },
  ],
}

export default function FindXSumI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Ranking">{step.ranked.length ? `Kept: ${step.chosen.map(item => `${item.value}×${item.count}`).join(', ')}. Window x-sum: ${step.total ?? '…'}` : `X-sums so far: [${step.answers.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Each window is processed on its own: count the values, rank them by frequency with larger values winning ties, and keep the first x.</p>
    <p>A value contributes its value times its total occurrences in the window, so a kept value adds all its copies.</p>
  </>} />
}
