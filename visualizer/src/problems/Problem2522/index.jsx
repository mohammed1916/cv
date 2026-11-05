import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix needs zero pieces.' },
    { id: 'skip', label: 'Leading zero', description: 'A piece cannot start with 0.' },
    { id: 'big', label: 'Too large', description: 'A piece whose value exceeds k is not allowed.' },
    { id: 'piece', label: 'Valid piece', description: 'A piece at most k extends the best count from its start.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest pieces, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (digits) and k (JSON)',
  url: 'https://leetcode.com/problems/partition-string-into-substrings-with-values-at-most-k/',
  complexity: 'O(n^2) substring checks, each in O(n) time. The visualization caps s at 12 digits and k at 1000.',
  examples: [
    { label: 'Example 1', input: '{"s":"165462","k":60}' },
    { label: 'Example 2', input: '{"s":"238182","k":5}' },
  ],
}

export default function PartitionIntoValuesAtMostK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of s (the current piece is marked)" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.end - 1}
      roleAt={i => {
        if (step.start < 0) return ''
        if (i === step.start) return 'l'
        if (i === step.end - 1) return 'r'
        return i > step.start && i < step.end - 1 ? 'inside piece' : ''
      }} />
    <IndexedSequence label="Fewest pieces for each prefix (- = unset)" length={step.dp.length} valueAt={i => (step.dp[i] === null || step.dp[i] === Infinity ? '-' : step.dp[i])} active={step.end}
      roleAt={i => (step.start >= 0 && i === step.start ? 'from' : '')} />
    <output aria-label="Piece">{step.start >= 0 ? `Piece ${run.input.s.slice(step.start, step.end)} covers digits ${step.start} to ${step.end - 1}` : `String ${run.input.s}, k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>A piece is valid when its first digit is not 0 and its value is at most k. Each prefix is split by choosing its last piece.</p>
    <p>The fewest pieces for a prefix is one more than the fewest for the prefix before that last piece. The l and r markers bound the piece being tested.</p>
  </>} />
}
