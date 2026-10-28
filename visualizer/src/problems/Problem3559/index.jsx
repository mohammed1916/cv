import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root the tree at node 1 and record depths.' },
    { id: 'query', label: 'Query', description: 'Climb the deeper node until the two endpoints meet, then count the edges.' },
    { id: 'done', label: 'Complete', description: 'All queries are answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and queries (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-assign-edge-weights-ii/',
  complexity: 'O(q * n) time with this climbing method. The visualization caps n at 10 and queries at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"edges":[[1,2]],"queries":[[1,1],[1,2]]}' },
    { label: 'Example 2', input: '{"n":5,"edges":[[1,2],[1,3],[3,4],[3,5]],"queries":[[1,4],[3,4],[2,5]]}' },
  ],
}

export default function EdgeWeightWays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Query answers" length={run.result.length} valueAt={i => (step.phase === 'done' || i < run.result.length && step.query && i === run.input.queries.findIndex(q => q === step.query) ? run.result[i] : '?')}
      active={step.query ? run.input.queries.findIndex(q => q === step.query) : -1} />
    <output aria-label="Current query">{step.query ? `Query ${step.query[0]} to ${step.query[1]}: ${step.answer} ways` : 'Choose a query'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the weights on the path matter, and a path with L edges has 2 to the power L minus 1 assignments with an odd total.</p>
  </>} />
}
