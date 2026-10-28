import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Zero', description: 'Count the number 0, which is the palindrome "0".' },
    { id: 'length', label: 'Length', description: 'Count the palindromes of this bit length that do not exceed n.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n from 0 to 10^15',
  url: 'https://leetcode.com/problems/count-binary-palindromic-numbers/',
  complexity: 'O(log^2 n) time: each of the O(log n) bit lengths is counted by binary search.',
  examples: [
    { label: 'Example 1', input: '9' },
    { label: 'Zero', input: '0' },
  ],
}

export default function CountBinaryPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Bit length">{`Bit length processed: ${step.length} of ${run.input.toString(2).length || 0}`}</output>
    <output aria-label="Count">{`Palindromes of this length: ${step.count}. Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A binary palindrome of a given length is fixed by its first half, and the palindromes of one length come out in increasing order.</p>
    <p>So the palindromes that do not exceed n form a prefix of the first halves, and binary search finds where it ends.</p>
  </>} />
}
