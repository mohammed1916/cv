import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the interval table for the full budget.' },
    { id: 'cell', label: 'Interval', description: 'Fill one interval, longest first within each length.' },
    { id: 'done', label: 'Complete', description: 'Report the whole-string entry.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and k',
  url: 'https://leetcode.com/problems/longest-palindromic-subsequence-after-at-most-k-operations/',
  complexity: 'O(n^2 * k) time and space for the interval table. The visualization caps s at 12 letters and k at 30.',
  examples: [
    { label: 'Own case 1', input: '{"s":"bcdfe","k":3}' },
    { label: 'Own case 2', input: '{"s":"bbbaaa","k":5}' },
    { label: 'Single letter, no operations', input: '{"s":"a","k":0}' },
    { label: 'Repeated letters', input: '{"s":"aaaa","k":2}' },
    { label: 'Largest budget', input: '{"s":"zyxwvutsrqpo","k":30}' },
    { label: 'Zero budget keeps the string', input: '{"s":"abcabc","k":0}' },
    { label: 'Long run: 12 letters', input: '{"s":"paxuiqtbekag","k":17}' },
  ],
}

export default function LongestPalindromeAfterOps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label="Best length per interval (rows start, columns end) at the full budget"
      matrix={step.table} activeCell={step.i >= 0 ? { row: step.i, col: step.j } : null} cellWidth={44} cellHeight={40} />
    <output aria-label="Current interval">{step.i >= 0 ? `Interval ${step.i} to ${step.j}` : 'No interval yet'}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is built from pairs of characters placed around a center. Each pair costs the cyclic distance between its letters, so the table tracks the remaining budget.</p>
    <p>An interval either drops one end or pairs its two ends and recurses inside with the leftover budget.</p>
  </>} />
}
