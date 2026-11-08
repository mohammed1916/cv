import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root the tree at node 0 and record distances.' },
    { id: 'query', label: 'Query', description: 'Walk the path between the two nodes and find the first node past half the weight.' },
    { id: 'done', label: 'Complete', description: 'All medians are found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and queries (JSON)',
  url: 'https://leetcode.com/problems/find-weighted-median-node-in-tree/',
  complexity: 'O(path length) per query with this climbing method. The visualization caps n at 8.',
  examples: [
    { label: 'Star around node one', input: '{"n":4,"edges":[[0,1,5],[1,2,3],[1,3,8]],"queries":[[2,3],[0,3]]}' },
    { label: 'Path through node zero', input: '{"n":3,"edges":[[2,0,4],[0,1,6]],"queries":[[1,2]]}' },
    { label: 'Two nodes', input: '{"n":2,"edges":[[0,1,3]],"queries":[[0,1]]}' },
    { label: 'Equal edge weights', input: '{"n":3,"edges":[[0,1,5],[1,2,5]],"queries":[[0,2],[2,0]]}' },
    { label: 'Largest weights', input: '{"n":4,"edges":[[0,1,20],[1,2,20],[2,3,1]],"queries":[[0,3],[3,0]]}' },
    { label: 'Long run: 8 nodes', input: '{"n":8,"edges":[[0,1,18],[1,2,17],[0,3,7],[0,4,11],[2,5,2],[1,6,8],[4,7,19]],"queries":[[5,6],[6,2],[3,2],[7,0],[4,0],[5,7]]}' },
  ],
}

export default function WeightedMedianNode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Answers by query" length={run.result.length} valueAt={i => (step.phase === 'done' || (step.query && run.input.queries[i] === step.query) ? run.result[i] : '?')}
      active={step.query ? run.input.queries.findIndex(q => q === step.query) : -1} />
    <output aria-label="Median">{step.query ? `Median of ${step.query[0]} to ${step.query[1]}: node ${step.median}` : 'Choose a query'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The median is the first node where the running weight from the start reaches half of the path weight, which the code checks with twice the running weight so no fractions appear.</p>
  </>} />
}
