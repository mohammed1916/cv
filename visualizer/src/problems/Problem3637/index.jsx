import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the three segments.' },
    { id: 'rise', label: 'First rise', description: 'Find where the first strictly increasing run ends.' },
    { id: 'fall', label: 'Fall', description: 'Find where the strictly decreasing run ends.' },
    { id: 'tail', label: 'Tail', description: 'Check that the last segment strictly increases.' },
    { id: 'done', label: 'Verdict', description: 'Return whether the array is trionic.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON array of 3 to 12 integers from -1000 to 1000)',
  url: 'https://leetcode.com/problems/trionic-array-i/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[1,3,5,4,2,6]' },
    { label: 'Too short', input: '[2,1,3]' },
  ],
}

export default function TrionicArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array segments" length={run.input.length} valueAt={i => run.input[i]} active={step.q}
      roleAt={i => (i <= step.p ? 'rising' : i <= step.q ? 'falling' : 'rising again')} />
    <output aria-label="Trionic state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The first rise must end at a peak p, and the fall from p must end at a valley q. Both are forced by the greedy scan.</p>
    <p>Trionic needs 0 less than p, p less than q, and q before the last index, so the tail has at least two values to rise through.</p>
  </>} />
}
