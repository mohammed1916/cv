import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1332', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with s made of a and b (JSON)',
  url: 'https://leetcode.com/problems/remove-palindromic-subsequences/',
  complexity: 'O(n) time and O(1) extra space, with at most two passes over the string.',
}

export default function PalindromeStepsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <IndexedSequence label="Letters of s" length={run.input.length} valueAt={i => run.input[i]} active={s.l ?? -1}
      roleAt={i => (s.l !== null && s.l !== undefined && i === s.l ? 'l' : s.r !== null && s.r !== undefined && i === s.r ? 'r' : '')} />
  }} renderReasoning={({ step }) => <>
    <p><strong>Two letters are enough:</strong> a palindromic subsequence can remove every a, or every b, and an a/b string that is not a palindrome needs exactly two steps.</p>
    <p>{step.message}</p>
  </>} />
}
