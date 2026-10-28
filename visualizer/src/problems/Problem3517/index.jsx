import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each letter in the palindrome.' },
    { id: 'place', label: 'Left half', description: 'Add half of a letter count to the left half, in alphabetical order.' },
    { id: 'middle', label: 'Middle', description: 'An odd-count letter goes in the centre.' },
    { id: 'done', label: 'Complete', description: 'Mirror the left half to finish.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with s, for example {"s": "babab"}',
  url: 'https://leetcode.com/problems/smallest-palindromic-rearrangement-i/',
  complexity: 'O(n + 26) time. The visualization caps s at 60 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"z"}' },
    { label: 'Example 2', input: '{"s":"babab"}' },
    { label: 'Example 3', input: '{"s":"daccad"}' },
  ],
}

export default function SmallestPalindromicRearrangement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Palindrome letters" length={run.input.s.length} valueAt={index => run.input.s[index]} active={-1} />
    <output aria-label="Build so far">{`Left half: ${step.left || '(empty)'}, middle: ${step.middle || '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome is fixed by its left half and its middle letter, so the smallest one puts the smallest letters first.</p>
    <p>Only the middle can hold an odd-count letter, and the right half mirrors the left half.</p>
  </>} />
}
