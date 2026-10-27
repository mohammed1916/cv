import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Positions', description: 'Record the positions of each digit in s.' },
    { id: 'match', label: 'Match', description: 'Match the next digit of t to its earliest unused position in s.' },
    { id: 'blocked', label: 'Blocked', description: 'A smaller digit sits before that position, so sorting cannot reach it.' },
    { id: 'missing', label: 'Missing', description: 'No unused copy of the needed digit remains in s.' },
    { id: 'done', label: 'Complete', description: 'Report whether s can become t.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit strings (JSON object with s and t of equal length)',
  url: 'https://leetcode.com/problems/check-if-string-is-transformable-with-substring-sort-operations/',
  complexity: 'O(n * 10) time with one queue of positions per digit. The visualization caps the strings at 8 digits.',
  examples: [
    { label: 'Official', input: '{"s":"84532","t":"34852"}' },
    { label: 'Blocked', input: '{"s":"12345","t":"12435"}' },
  ],
}

export default function TransformableString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s (digits)" length={run.s.length} active={step.active}
      valueAt={index => run.s[index]}
      roleAt={index => (step.consumed.includes(index) ? 'used' : '')} />
    <output aria-label="Target progress">{`t position ${Math.min(step.index + 1, run.t.length)} of ${run.t.length}: ${run.t}`}</output>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Sorting a substring only moves smaller digits to the left. Each digit of t must therefore come from the earliest unused copy of that digit in s.</p>
    <p>That copy can be used only if no smaller digit still unused sits before it, because such a digit can never move past it.</p>
  </>} />
}
