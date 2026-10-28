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
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1,2],[2,0,4]],"queries":[[0,1],[2,0],[1,2]]}' },
    { label: 'Example 3', input: '{"n":5,"edges":[[0,1,2],[0,2,5],[1,3,1],[2,4,3]],"queries":[[3,4],[1,2]]}' },
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
