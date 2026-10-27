import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the values so the extremes are at the ends.' },
    { id: 'pair', label: 'Pair', description: 'Take the smallest and largest remaining values and record their average.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct averages.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/number-of-distinct-averages/',
  complexity: 'O(n log n) time for sorting and O(n) for the pairing. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example', input: '{"nums":[4,1,4,0,3,5]}' },
    { label: 'Repeated', input: '{"nums":[1,100,1,100]}' },
  ],
}

export default function DistinctAverages() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted values" length={step.values.length} valueAt={i => step.values[i]} active={step.left}
      roleAt={i => (i === step.right ? 'right' : '')} />
    <output aria-label="Distinct averages">{`Distinct averages: ${step.seen.length ? step.seen.join(', ') : 'none yet'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Pairs are taken from the outside in, and two pairs with the same sum have the same average, so a set of sums is enough.</p>
  </>} />
}
