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
  question: "Find the longest substring that becomes a palindrome after deleting one character.",
  approaches: [
    { name: "Two pointers on each substring", intuition: "Match from both ends and allow one mismatch; try every substring.", time: "O(n^3)", space: "O(1)" },
    { name: "Expand around each centre", intuition: "From each centre, expand while matching and allow one skipped character.", time: "O(n^2)", space: "O(1)" },
  ],
  examples: [
    { label: 'Example 1', input: '{"s":"abca"}' },
    { label: 'Example 2', input: '{"s":"abba"}' },
    { label: 'Example 3', input: '{"s":"zzabba"}' },
    { label: 'Shortest string', input: '{"s":"aa"}' },
    { label: 'Equal letters', input: '{"s":"zzzz"}' },
    { label: 'Thirty letters', input: '{"s":"abcdefghijklmnopqrstuvwxyzabcd"}' },
    { label: 'Long run: 30 letters', input: '{"s":"sojtebjnqaommjhlrfrduzninclcpy"}' },
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
