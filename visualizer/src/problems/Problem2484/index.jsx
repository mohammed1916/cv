import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty total', description: 'No palindrome has been counted yet.' },
    { id: 'middle', label: 'Middle index', description: 'Count the pairs on each side of this middle digit.' },
    { id: 'done', label: 'Complete', description: 'Report the total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit string of 5 to 40 characters (JSON string)',
  url: 'https://leetcode.com/problems/count-palindromic-subsequences/',
  complexity: 'O(n^3) time here for a simple pair count, and O(1) extra space per middle position. The visualization caps input at 40 digits.',
  examples: [
    { label: 'Example 1', input: '"103301"' },
    { label: 'All zeros', input: '"0000000"' },
  ],
}

export default function PalindromicSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of s" length={run.input.length} valueAt={index => run.input[index]} active={step.m ?? -1} roleAt={index => (index === step.m ? 'middle' : '')} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A palindrome of length 5 has a middle digit, a pair of outer digits that match, and a pair of inner digits that match.</p>
    <p>For each middle index, count the matching pairs to its left and to its right, then multiply them by digit.</p>
  </>} />
}
