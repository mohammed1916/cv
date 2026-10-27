import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Node 0 begins the first piece.' },
    { id: 'link', label: 'Link', description: 'Join a node to its left neighbour when the gap is small enough.' },
    { id: 'query', label: 'Query', description: 'Two nodes are connected when they share a piece.' },
    { id: 'done', label: 'Complete', description: 'Report every query answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n, sorted nums, max_diff and queries as JSON, e.g. {"n": 2, "nums": [1,3], "max_diff": 1, "queries": [[0,0],[0,1]]}',
  url: 'https://leetcode.com/problems/path-existence-queries-in-a-graph-i/',
  complexity: 'O(n + q) time after the sort, since pieces are runs of consecutive sorted values.',
  examples: [
    { label: 'Example 1', input: '{"n": 2, "nums": [1,3], "max_diff": 1, "queries": [[0,0],[0,1]]}' },
    { label: 'Example 2', input: '{"n": 4, "nums": [2,5,6,8], "max_diff": 2, "queries": [[0,1],[0,2],[1,3],[2,3]]}' },
  ],
}

export default function PathExistenceQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Piece label per node" length={run.input.n} valueAt={i => step.comp[i]}
        active={step.query ? step.query[1] : -1} roleAt={i => (step.query && step.query.includes(i) ? 'in-query' : '')} />
      <output aria-label="Current step">{step.message}</output>
      <p>{`Node values: ${run.input.nums.join(', ')} (max difference ${run.input.max_diff})`}</p>
    </>
  )} renderReasoning={() => (
    <>
      <p>Values are sorted, so two nodes connect through a chain of neighbours with gaps no larger than max_diff, and a gap that is too large splits the pieces.</p>
      <p>Each piece is a run of consecutive nodes, so a query is answered by comparing piece labels in constant time.</p>
    </>
  )} />
}
