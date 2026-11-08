import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Track reachable sums up to the largest value.' },
    { id: 'zero', label: 'Zero', description: 'An already zero array needs no queries.' },
    { id: 'query', label: 'Query', description: 'Add the next query to the indices it covers.' },
    { id: 'update', label: 'Update', description: 'Each covered index may subtract val or skip it.' },
    { id: 'check', label: 'Check', description: 'Test whether every index reaches its target.' },
    { id: 'done', label: 'Result', description: 'Report the first k that works, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([l, r, val] triples)',
  url: 'https://leetcode.com/problems/zero-array-transformation-iv/',
  complexity: 'O(k * n * cap) time for k queries, n indices and cap = max(nums); the visualization caps the sizes.',
  examples: [
    { label: 'Example', input: '{"nums":[1,0,1],"queries":[[0,2,1],[2,2,2]]}' },
    { label: 'Needs three', input: '{"nums":[3,1],"queries":[[0,0,1],[0,0,2],[1,1,1]]}' },
    { label: 'Single element', input: '{"nums":[5],"queries":[[0,0,3]]}' },
    { label: 'Equal values in overlapping ranges', input: '{"nums":[2,2,2],"queries":[[0,2,2],[1,1,2]]}' },
    { label: 'Largest values', input: '{"nums":[12,0,12,0,12,0],"queries":[[0,5,6],[0,0,1],[5,5,6]]}' },
    { label: 'All zeros with one query', input: '{"nums":[0,0,0,0],"queries":[[0,3,1]]}' },
    { label: 'Long run: 6 values, 8 queries', input: '{"nums":[7,1,4,11,5,3],"queries":[[5,5,4],[0,0,1],[5,5,4],[0,2,5],[5,5,3],[0,1,1],[3,5,3],[0,4,2]]}' },
  ],
}

export default function ZeroArrayTransformationIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums target" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.range && i >= step.range[0] && i <= step.range[1] ? 'in query' : '')} />
    <output aria-label="Reachable sums">{`query ${step.k}${step.query ? ` = [${step.query.join(', ')}]` : ''}; reachable: ${step.reach.map((row, i) => `[${i}] {${row.join(', ')}}`).join('  ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Within one query, each index independently either drops by val or does not. So an index can reach a value exactly when that value is a subset sum of the vals covering it so far.</p>
    <p>Adding queries only adds options, so the first k that works is found by growing k one query at a time and stopping early.</p>
  </>} />
}
