import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the prefix GCD list.' },
    { id: 'prefix', label: 'Prefix GCD', description: 'Pair each value with the running maximum.' },
    { id: 'sort', label: 'Sort', description: 'Order the prefix GCDs.' },
    { id: 'pair', label: 'Pair', description: 'Add the GCD of the smallest and largest remaining values.' },
    { id: 'done', label: 'Complete', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.doocs.org/en/lc/3867/',
  complexity: 'O(n log n) time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,4]}' },
    { label: 'Example 2', input: '{"nums":[3,6,2,8]}' },
  ],
}

export default function SumGcdFormedPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prefixGcd (sorted once built)" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.pair ? step.pair[0] : -1}
      roleAt={i => (step.pair && (i === step.pair[0] || i === step.pair[1]) ? 'pair' : '')} />
    <output aria-label="Total">{`Input length ${run.input.nums.length}, total ${step.total ?? 0}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After sorting, the smallest value pairs with the largest, the next pair moves inward, and an odd middle value is skipped.</p>
  </>} />
}
