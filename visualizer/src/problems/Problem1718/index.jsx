import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'All slots are empty.' },
    { id: 'place', label: 'Place', description: 'Put the largest value that fits into its slots.' },
    { id: 'undo', label: 'Undo', description: 'Clear the placement because no completion exists.' },
    { id: 'done', label: 'Complete', description: 'Report the lexicographically largest sequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with integer n (JSON)',
  url: 'https://leetcode.com/problems/construct-the-lexicographically-largest-valid-sequence/',
  complexity: 'Backtracking with pruning. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"n":3}' },
    { label: 'Example 2', input: '{"n":4}' },
  ],
}

export default function LargestSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sequence slots" length={2 * run.input.n - 1} active={step.index < 2 * run.input.n - 1 ? step.index : -1}
      valueAt={index => (step.seq[index] === 0 ? '·' : step.seq[index])}
      roleAt={index => (step.seq[index] !== 0 ? 'filled' : '')} />
    <output aria-label="Placement">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Trying larger values first makes the sequence lexicographically largest, so the first complete arrangement found is the answer.</p>
    <p>A value k occupies two slots k apart (and 1 occupies one slot), so placements are checked for room before they are made.</p>
  </>} />
}
