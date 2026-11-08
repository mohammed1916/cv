import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The count begins at zero.' },
    { id: 'start-index', label: 'Start index', description: 'Grow subarrays from this index and track the prime range.' },
    { id: 'done', label: 'Complete', description: 'Report the total count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/count-prime-gap-balanced-subarrays/',
  complexity: 'O(n^2) time for the subarray scan. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Three numbers, k two', input: '{"nums":[11,4,8],"k":2}' },
    { label: 'Twelve equal ones', input: '{"nums":[1,1,1,1,1,1,1,1,1,1,1,1],"k":0}' },
    { label: 'Single one, k 0', input: '{"nums":[1],"k":0}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4],"k":2}' },
    { label: 'Largest values and k', input: '{"nums":[60,59,58,1],"k":60}' },
    { label: 'Long run: 12 values', input: '{"nums":[8,11,18,52,33,23,18,35,60,11,52,20],"k":7}' },
  ],
}

export default function PrimeGapBalancedSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.start ?? -1} />
    <output aria-label="Count">{`Balanced subarrays counted: ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Extending the end one element at a time keeps the smallest and largest prime current without rescanning the subarray.</p>
  </>} />
}
