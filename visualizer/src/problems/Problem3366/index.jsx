import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No moves used yet.' },
    { id: 'element', label: 'Element', description: 'Consider the fates of one number.' },
    { id: 'update', label: 'Keep best', description: 'Keep the smallest sum for each usage pattern.' },
    { id: 'done', label: 'Result', description: 'Choose the smallest final sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, k, op1 and op2',
  url: 'https://leetcode.com/problems/minimum-array-sum/description/',
  complexity: 'O(n * op1 * op2) states with at most four fates each. The visualization caps nums at 6 values.',
  examples: [
    { label: 'Invented set', input: JSON.stringify({ nums: [9, 4, 7], k: 3, op1: 1, op2: 1 }) },
    { label: 'Two halvings', input: JSON.stringify({ nums: [12, 5], k: 4, op1: 2, op2: 0 }) },
  ],
}

export default function MinimumArraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at} />
    <ul aria-label="Usage patterns">
      {step.table.map(row => <li key={row.key}>{`used (halve, subtract) = (${row.key}), smallest sum ${row.sum}`}</li>)}
    </ul>
    {step.result !== undefined && <output aria-label="Minimum sum">{`Minimum sum ${step.result}`}</output>}
  </>} renderReasoning={() => <>
    <p>Each number is independent except for the shared move limits. A table keyed by how many halvings and subtractions were spent stores the smallest sum reachable with that usage.</p>
    <p>When a number gets both moves, the two orders can give different values, so the cheaper order is kept.</p>
  </>} />
}
