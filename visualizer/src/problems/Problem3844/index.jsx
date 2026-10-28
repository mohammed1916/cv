import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No substring has been checked yet.' },
    { id: 'check', label: 'Check', description: 'Test whether this substring is almost a palindrome.' },
    { id: 'found', label: 'Found', description: 'This substring is almost a palindrome and may be the new best.' },
    { id: 'done', label: 'Complete', description: 'Report the longest length found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string (JSON object with s)',
  url: 'https://leetcode.com/problems/longest-almost-palindromic-substring/',
  complexity: 'O(n^3) time for this teaching version. The visualization caps input at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abca"}' },
    { label: 'Example 2', input: '{"s":"abba"}' },
    { label: 'Example 3', input: '{"s":"zzabba"}' },
  ],
}

export default function LongestAlmostPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.r}
      roleAt={i => (step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Best">{`Best length so far: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Matching the ends inward finds the first mismatch. Removing one character from that mismatch is the only fix, so the check tries dropping the left or the right side.</p>
  </>} />
}
