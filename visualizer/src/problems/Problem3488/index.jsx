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
    { label: 'Five values, three queries', input: '{"nums":[4,1,7,7,2],"queries":[0,3,4]}' },
    { label: 'Example 2', input: '{"nums":[1,2,1,2],"queries":[0,1,2,3]}' },
    { label: 'Single element, one query', input: '{"nums":[4],"queries":[0]}' },
    { label: 'Equal values, repeated query', input: '{"nums":[3,3,3],"queries":[2,2,0]}' },
    { label: 'Largest values, every index', input: '{"nums":[9,1,9,1,9,1,9,1,9,1],"queries":[0,1,2,3,4,5,6,7,8,9]}' },
    { label: 'Long run: 10 values, 10 queries', input: '{"nums":[3,5,4,7,2,5,3,4,3,3],"queries":[6,9,4,0,2,0,0,3,4,0]}' },
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
