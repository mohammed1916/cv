import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty list', description: 'Start with no pair gcds.' },
    { id: 'pairs', label: 'Pair gcds', description: 'Add the gcd of each pair of indices i < j.' },
    { id: 'sort', label: 'Sort', description: 'Sort every pair gcd in increasing order.' },
    { id: 'query', label: 'Query', description: 'Read the sorted value at a query position.' },
    { id: 'done', label: 'Complete', description: 'Report the answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries (JSON)',
  url: 'https://leetcode.com/problems/sorted-gcd-pair-queries/',
  complexity: 'O(n^2 log n) time for n numbers, since every pair is stored and sorted. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,4],"queries":[0,2,2]}' },
    { label: 'Example 2', input: '{"nums":[4,3,12,8],"queries":[0,4]}' },
    { label: 'Smallest input', input: '{"nums":[1,1],"queries":[0]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6],"queries":[0,1,2]}' },
    { label: 'Largest values, length 10', input: '{"nums":[200,1,200,1,200,1,200,1,200,1],"queries":[0,9,18,27,36,44]}' },
    { label: 'Long run: 10 numbers', input: '{"nums":[108,148,58,122,14,150,85,14,77,182],"queries":[42,43,41,42,26,29,31,28,18,33]}' },
  ],
}

export default function SortedGcdPairQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Pair gcds" length={step.values.length} valueAt={i => step.values[i]} active={step.active} />
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every pair gcd is collected once, so the whole multiset is known before any query is answered.</p>
    <p>After sorting, a query is just a position in the list, which makes each answer a single lookup.</p>
  </>} />
}
