import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the palindromes that could be formed.' },
    { id: 'skip', label: 'Skip block', description: 'Whole blocks of palindromes starting with a smaller letter are skipped.' },
    { id: 'place', label: 'Place letter', description: 'The block that contains the k-th palindrome fixes the next letter.' },
    { id: 'none', label: 'Empty', description: 'There are too few palindromes.' },
    { id: 'done', label: 'Complete', description: 'Build the palindrome from the left half.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with s and k, for example {"s": "abba", "k": 2}',
  url: 'https://leetcode.com/problems/smallest-palindromic-rearrangement-ii/',
  complexity: 'O(n * 26) block counts with big integers. The visualization caps s at 60 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abba","k":2}' },
    { label: 'Example 2', input: '{"s":"aa","k":2}' },
    { label: 'Example 3', input: '{"s":"bacab","k":1}' },
  ],
}

export default function SmallestPalindromicRearrangementTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Left half so far">{`Left half so far: ${step.left || '(empty)'}`}</output>
    <output aria-label="Remaining rank">{`Remaining rank k: ${step.rank}`}</output>
  </>} renderReasoning={() => <>
    <p>Distinct palindromes correspond to distinct arrangements of the left half, so the k-th palindrome is found by choosing one letter at a time.</p>
    <p>Each letter choice owns a block of palindromes; whole blocks are skipped by subtracting their size from k.</p>
  </>} />
}
