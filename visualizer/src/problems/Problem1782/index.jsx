import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'degree', label: 'Degrees', description: 'Count how many edges touch each node.' },
    { id: 'sort', label: 'Sort', description: 'Sort the degrees so pairs can be counted with two pointers.' },
    { id: 'query', label: 'Count pairs', description: 'Count pairs whose degree sum is above the query.' },
    { id: 'correct', label: 'Correct', description: 'Remove pairs whose shared edges were counted twice.' },
    { id: 'done', label: 'Complete', description: 'Report one answer per query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and queries (JSON)',
  url: 'https://leetcode.com/problems/count-pairs-of-nodes/',
  complexity: 'O(E log E + Q(n + E)) time in this version. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"edges":[[1,2],[2,4],[1,3],[2,3],[2,1]],"queries":[2,3]}' },
    { label: 'Parallel edges', input: '{"n":2,"edges":[[1,2],[1,2]],"queries":[1,2]}' },
  ],
}

export default function CountPairsOfNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted degrees" length={step.sorted.length} valueAt={i => step.sorted[i]} />
    <output aria-label="Query state">{step.query === null ? 'Preparing degrees.' : `Query ${step.query}: ${step.total} pairs so far.`}</output>
  </>} renderReasoning={() => <>
    <p>The number of edges touching both nodes of a pair is counted twice when adding degrees, so shared edges are subtracted.</p>
    <p>Only pairs joined by at least one edge need correction, and those are listed explicitly.</p>
  </>} />
}
