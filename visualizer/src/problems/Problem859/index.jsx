import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Compare', description: 'Find the positions where the strings disagree.' },
    { id: 'differ', label: 'Differ', description: 'A differing position is recorded.' },
    { id: 'same', label: 'Match', description: 'Matching positions are skipped.' },
    { id: 'equal', label: 'Equal', description: 'Identical strings need a repeated letter.' },
    { id: 'done', label: 'Verdict', description: 'Return whether one swap works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's and goal (JSON object)',
  url: 'https://leetcode.com/problems/buddy-strings/',
  complexity: 'O(n) time and O(n) space for the letter set.',
  examples: [
    { label: 'Cross swap', input: '{"s":"tenor","goal":"notre"}' },
    { label: 'Repeat', input: '{"s":"lemon","goal":"lemon"}' },
    { label: 'Unique', input: '{"s":"fizz","goal":"fizz"}' },
  ],
}

export default function BuddyStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`s (differing positions marked)`} length={run.input.s.length} active={step.i ?? -1}
      valueAt={i => run.input.s[i]}
      roleAt={i => (step.diff.includes(i) ? 'differs' : '')} />
    <IndexedSequence label="goal" length={run.input.goal.length} active={step.i ?? -1}
      valueAt={i => run.input.goal[i]}
      roleAt={i => (step.diff.includes(i) ? 'differs' : '')} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A single swap can only fix exactly two positions, and they must cross-match. When the strings are already equal, a swap is only harmless if two equal letters are swapped, so a repeated letter is required.</p>
  </>} />
}
