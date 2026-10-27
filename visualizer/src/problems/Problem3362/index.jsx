import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is used yet.' },
    { id: 'expire', label: 'Expire', description: 'Stop counting queries that ended before this index.' },
    { id: 'push', label: 'Push', description: 'Add the queries that start here to the heap.' },
    { id: 'pick', label: 'Pick', description: 'Use the query with the farthest right end to cover this index.' },
    { id: 'fail', label: 'Impossible', description: 'Not enough queries reach this index.' },
    { id: 'done', label: 'Complete', description: 'Report how many queries can be removed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([l, r] pairs, JSON)',
  url: 'https://leetcode.com/problems/zero-array-transformation-iii/',
  complexity: 'O((n + q) log q) time with a heap. The visualization caps n at 6 and q at 7.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,0,2],"queries":[[0,2],[0,2],[1,1]]}' },
    { label: 'Example 2', input: '{"nums":[1,1,1,1],"queries":[[1,3],[0,2],[1,3],[1,2]]}' },
  ],
}

export default function ZeroArrayTransformation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Required coverage (nums)" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.at} roleAt={i => (i === step.at ? `covered ${step.cover}` : '')} />
    <output aria-label="Heap and used">{`Heap (largest right end on top): [${step.heap.join(', ')}]  used: ${step.used}`}</output>
  </>} renderReasoning={() => <>
    <p>Each query can lower any subset of its range by one, so a set of queries works when every index is covered at least nums[i] times. The goal is to use as few queries as possible.</p>
    <p>Sweeping left to right, a query that reaches far to the right is the most useful one to pick, so the heap hands out the largest right ends first. Unused queries are the ones removed.</p>
  </>} />
}
