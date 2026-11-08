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
  url: 'https://leetcode.com/problems/find-x-sum-of-all-k-long-subarrays-ii/',
  complexity: 'O((n - k + 1) * k log k) time for the per-window sort. The statement allows far larger arrays; the visualization caps nums at 40 values.',
  examples: [
    { label: 'Six entries, k four', input: '{"nums":[8,8,3,12,5,1],"k":4,"x":2}' },
    { label: 'Largest allowed x', input: '{"nums":[20,30,10],"k":3,"x":3}' },
    { label: 'Single entry', input: '{"nums":[5],"k":1,"x":1}' },
    { label: 'Equal values', input: '{"nums":[4,4,4],"k":3,"x":1}' },
    { label: 'Largest allowed size, equal values', input: '{"nums":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"k":40,"x":40}' },
    { label: 'Long run: 40 entries', input: '{"nums":[37,45,43,17,7,5,29,43,5,8,40,34,42,17,23,16,50,33,6,9,33,25,44,33,49,5,23,3,11,8,4,38,5,39,21,8,33,23,48,47],"k":20,"x":5}' },
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
