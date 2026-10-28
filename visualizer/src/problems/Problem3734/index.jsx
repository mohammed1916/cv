import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the letters and check the odd counts.' },
    { id: 'check', label: 'Try target half', description: 'Test the palindrome built from the target half.' },
    { id: 'found', label: 'Found', description: 'The smallest palindrome above target.' },
    { id: 'done', label: 'Complete', description: 'No palindromic permutation is above target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and target, for example {"s":"baba","target":"abba"}',
  url: 'https://leetcode.com/problems/lexicographically-smallest-palindromic-permutation-greater-than-target/',
  complexity: 'O(n * 26) time for strings of length n. The visualization caps the strings at 8 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"baba","target":"abba"}' },
    { label: 'Example 4', input: '{"s":"aac","target":"abb"}' },
  ],
}

export default function SmallestPalindromeAboveTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Half">{`Half letters: ${step.half || '(none)'}`}</output>
    <output aria-label="Candidate">{`Candidate palindrome: ${step.candidate || '(none)'}. Target: ${run.input.target}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is fixed by its first half, so only the first half needs to be chosen and the rest is a mirror image.</p>
    <p>If the target's first half is itself usable, that palindrome may or may not beat the target. Otherwise the smallest larger half gives the answer.</p>
  </>} />
}
