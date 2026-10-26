import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the range.' },
    { id: 'reject', label: 'Reject', description: 'A palindromic root whose square is not a palindrome.' },
    { id: 'accept', label: 'Accept', description: 'A palindromic root whose square is a palindrome.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {left, right} (JSON)',
  url: 'https://leetcode.com/problems/super-palindromes/',
  complexity: 'About 2000 candidate roots, each checked in O(digits). The visualization caps right at 10^12 (LeetCode allows 10^18) and shows the latest 60 candidates.',
  examples: [
    { label: 'Example 1', input: '{"left":"4","right":"1000"}' },
    { label: 'Example 2', input: '{"left":"1","right":"2"}' },
    { label: 'Wide range', input: '{"left":"1","right":"1000000000000"}' },
  ],
}

export default function SuperPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const cands = step.candidates ?? []
    return <>
      <IndexedSequence label="Candidate roots (latest 60)" length={cands.length} active={step.index === undefined || step.index < 0 ? -1 : cands.length - 1}
        valueAt={i => cands[i].root} roleAt={i => cands[i].ok ? 'accepted' : 'rejected'} />
      <IndexedSequence label="Their squares" length={cands.length} valueAt={i => cands[i].sq} roleAt={i => cands[i].ok ? 'accepted' : 'rejected'} />
      <output aria-label="Count">Super-palindromes found: {step.count}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A palindrome is determined by its first half, so roots are enumerated as half + mirror (even length) or half + mirror without the middle digit (odd length), instead of testing every integer.</p>
  </>} />
}
