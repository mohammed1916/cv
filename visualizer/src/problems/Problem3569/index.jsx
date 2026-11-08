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
    { label: 'Repeated values, two updates', input: '{"nums":[6,6,6],"queries":[[0,1],[2,50]]}' },
    { label: 'Single update at the end', input: '{"nums":[10,20,30,40,50,1,2,3],"queries":[[7,9]]}' },
    { label: 'Two values', input: '{"nums":[1,2],"queries":[[0,3]]}' },
    { label: 'Equal values', input: '{"nums":[4,4,4],"queries":[[1,4],[2,4]]}' },
    { label: 'Largest values', input: '{"nums":[50,1,50,1,50],"queries":[[4,50],[0,1]]}' },
    { label: 'Long run: 10 values, 6 queries', input: '{"nums":[50,46,23,50,42,9,21,6,44,49],"queries":[[6,34],[4,49],[3,20],[5,40],[0,3],[8,26]]}' },
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
