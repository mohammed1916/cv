import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Single letters', description: 'Each one-letter string is a palindrome.' },
    { id: 'mismatch', label: 'Mismatch ends', description: 'Combine the two shorter intervals and subtract the overlap.' },
    { id: 'match', label: 'Matching ends', description: 'Count palindromes with and without the outer letters.' },
    { id: 'done', label: 'Complete', description: 'Return the count for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'String s (JSON string, up to 12 letters)',
  url: 'https://leetcode.com/problems/count-different-palindromic-subsequences/',
  complexity: 'O(n²) states with O(1) work each in this version. The visualization is limited to n ≤ 12 because it stores the whole table.',
  examples: [
    { label: 'Four letters', input: '"bccb"' },
    { label: 'Repeats', input: '"abcdabcdabcdabcdabcd"' },
    { label: 'Single letter', input: '"a"' },
    { label: 'Repeated letters', input: '"aaaa"' },
    { label: 'Longest allowed', input: '"abcdabcdabcd"' },
    { label: 'Long run: 12 letters', input: '"cbccdbabdcac"' },
  ],
}

export default function DifferentPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String s with pointers" length={run.input.length} valueAt={k => run.input[k]} active={-1} roleAt={k => (k === step.row ? 'i' : k === step.column ? 'j' : k === step.l ? 'l' : k === step.r ? 'r' : '')} />
    <DPTable title="Distinct palindromes in s[i..j]" values={step.table} rowLabels={run.input.split('').map((c, i) => `${i}${c}`)}
      columnLabels={run.input.split('').map((c, j) => `${j}${c}`)} activeCell={{ row: step.row, column: step.column }} />
    <output aria-label="Count">{step.phase === 'done' ? `Count: ${step.result}` : `Cell [${step.row}, ${step.column}]`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Nearest matches:</strong> the nearest matching letters inside decide whether a palindrome is counted once or twice.</p>
  </>} />
}
