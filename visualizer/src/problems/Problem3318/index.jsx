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
    { label: 'Example 1', input: '{"nums":[1,1,2,2,3,4,2,3],"k":6,"x":2}' },
    { label: 'Example 2', input: '{"nums":[3,8,7,8,7,5],"k":2,"x":2}' },
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
