import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Group the indices by value.' },
    { id: 'query', label: 'Query', description: 'Find the nearest equal neighbours.' },
    { id: 'done', label: 'Complete', description: 'Return the answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "nums" and "queries" (indices into nums), JSON',
  url: 'https://leetcode.com/problems/closest-equal-element-queries/',
  complexity: 'O(n + q times k) time for n values, q queries and k equal values. The visualization caps input at 10 values and 10 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,1,4,1,3,2],"queries":[0,3,5]}' },
    { label: 'Example 2', input: '{"nums":[1,2,1,2],"queries":[0,1,2,3]}' },
  ],
}

export default function ClosestEqualElementQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='nums' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Around a circle the nearest equal element is one of the two neighbours in the sorted list of its value, measured both ways round.</p>
    <p>Grouping indices by value means each query looks at only the indices that can match it.</p>
  </>} />
}
