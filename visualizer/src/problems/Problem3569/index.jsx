import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the original array.' },
    { id: 'query', label: 'Query', description: 'Apply the update, then score every split point.' },
    { id: 'done', label: 'Complete', description: 'Report one answer per query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries (JSON)',
  url: 'https://leetcode.com/problems/maximize-count-of-distinct-primes-after-split/',
  complexity: 'O(q * n * m) time with a set per split. The visualization caps n at 10 and queries at 6.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,3,1,2],"queries":[[1,2],[3,3]]}' },
    { label: 'Example 2', input: '{"nums":[2,1,4],"queries":[[0,1]]}' },
  ],
}

export default function DistinctPrimesAfterSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.query ? step.query[0] : -1} />
    <output aria-label="Best split">{step.query ? `Best split at ${step.split} gives ${step.best} distinct primes` : 'Choose a query'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A split counts distinct primes on each side separately, so repeated primes on one side count once.</p>
  </>} />
}
