import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Process the values from smallest to largest.' },
    { id: 'take', label: 'Take', description: 'Give this value a new distinct target.' },
    { id: 'skip', label: 'Skip', description: 'No new distinct target is reachable.' },
    { id: 'done', label: 'Complete', description: 'Report the distinct count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 8 values from 0 to 30) and k (0 to 5) (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-distinct-elements-after-operations/',
  complexity: 'O(n log n) for the sort. The visualization caps input at 8 values.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[2,3,3,4,4,5],"k":3}' },
    { label: 'Own case 2', input: '{"nums":[5,5,5,5],"k":2}' },
    { label: 'Single value, k zero', input: '{"nums":[7],"k":0}' },
    { label: 'Equal values', input: '{"nums":[9,9,9,9,9],"k":2}' },
    { label: 'Extremes alternate', input: '{"nums":[0,30,0,30,0,30,0,30],"k":5}' },
    { label: 'Long run: 8 values', input: '{"nums":[15,5,15,18,26,14,12,20],"k":3}' },
  ],
}

export default function DistinctAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original values" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.index} roleAt={i => (step.assigned[i] !== null ? `now ${step.assigned[i]}` : 'pending')} />
    <output aria-label="Distinct count so far">{`Distinct count so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Each value can move within k of itself by one shared step, so the best target for a value is the smallest free number above the previous target that is still in range.</p>
    <p>Processing values in sorted order makes that greedy choice safe, since earlier values never need a target above a later one's.</p>
  </>} />
}
